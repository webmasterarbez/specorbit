import { describe, it, expect } from 'vitest';
import {
  getSkillReferenceTransformer,
  getTransformerForTool,
  transformCommandInvocations,
  transformToSkillReferences,
} from '../../src/utils/command-references.js';
import type { CommandInvocation } from '../../src/core/command-generation/invocation.js';
import { getApplyChangeSkillTemplate } from '../../src/core/templates/workflows/apply-change.js';

const FLAT_SLASH: CommandInvocation = { style: 'flat', prefix: '/' };
const FLAT_AT: CommandInvocation = { style: 'flat', prefix: '@' };
const NAMESPACED_SLASH: CommandInvocation = { style: 'namespaced', prefix: '/' };

/** The `/orbit-<id>` case, which most flat tools use. */
const transformToHyphenCommands = (text: string): string =>
  transformCommandInvocations(text, FLAT_SLASH);

describe('transformCommandInvocations', () => {
  describe('basic transformations', () => {
    it('should transform single command reference', () => {
      expect(transformToHyphenCommands('/orbit:new')).toBe('/orbit-new');
    });

    it('should transform multiple command references', () => {
      const input = '/orbit:new and /orbit:apply';
      const expected = '/orbit-new and /orbit-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should transform command reference in context', () => {
      const input = 'Use /orbit:apply to implement tasks';
      const expected = 'Use /orbit-apply to implement tasks';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/orbit:continue` to proceed';
      const expected = 'Run `/orbit-continue` to proceed';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToHyphenCommands('')).toBe('');
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new orbit: /other:command';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should handle multiple occurrences on same line', () => {
      const input = '/orbit:new /orbit:continue /orbit:apply';
      const expected = '/orbit-new /orbit-continue /orbit-apply';
      expect(transformToHyphenCommands(input)).toBe(expected);
    });

    it('should leave unknown command references unchanged', () => {
      // Mirrors transformToSkillReferences: an invented id is left as written
      // rather than reshaped into a command that does not exist either.
      const input = 'Try /orbit:unknown-command here';
      expect(transformToHyphenCommands(input)).toBe(input);
    });

    it('should rewrite only the known id on a mixed line', () => {
      expect(transformToHyphenCommands('/orbit:apply and /orbit:bogus')).toBe(
        '/orbit-apply and /orbit:bogus'
      );
    });
  });

  describe('multiline content', () => {
    it('should transform references across multiple lines', () => {
      const input = `Use /orbit:new to start
Then /orbit:continue to proceed
Finally /orbit:apply to implement`;
      const expected = `Use /orbit-new to start
Then /orbit-continue to proceed
Finally /orbit-apply to implement`;
      expect(transformToHyphenCommands(input)).toBe(expected);
    });
  });

  describe('all known commands', () => {
    const commands = [
      'new',
      'continue',
      'apply',
      'update',
      'ff',
      'sync',
      'archive',
      'bulk-archive',
      'verify',
      'explore',
      'onboard',
    ];

    for (const cmd of commands) {
      it(`should transform /orbit:${cmd}`, () => {
        expect(transformToHyphenCommands(`/orbit:${cmd}`)).toBe(`/orbit-${cmd}`);
      });
    }
  });

  describe('non-slash prefixes', () => {
    it("spells Amazon Q's prompt library form, replacing the slash", () => {
      // The whole `/orbit:` is consumed, so no stray slash survives: it is
      // `@orbit-apply`, never `/@orbit-apply` or `@/orbit-apply`.
      expect(transformCommandInvocations('/orbit:apply', FLAT_AT)).toBe('@orbit-apply');
      expect(transformCommandInvocations('Run `/orbit:archive` when done.', FLAT_AT)).toBe(
        'Run `@orbit-archive` when done.'
      );
    });

    it('leaves unknown ids alone under a non-slash prefix too', () => {
      expect(transformCommandInvocations('/orbit:apply and /orbit:bogus', FLAT_AT)).toBe(
        '@orbit-apply and /orbit:bogus'
      );
    });

    it('is a no-op for the canonical namespaced slash form', () => {
      const input = 'Use /orbit:new then /orbit:apply';
      expect(transformCommandInvocations(input, NAMESPACED_SLASH)).toBe(input);
    });
  });
});

describe('transformToSkillReferences', () => {
  describe('all known commands', () => {
    const mappings: Array<[string, string]> = [
      ['explore', '/specorbit-explore'],
      ['new', '/specorbit-new-change'],
      ['continue', '/specorbit-continue-change'],
      ['apply', '/specorbit-apply-change'],
      ['update', '/specorbit-update-change'],
      ['ff', '/specorbit-ff-change'],
      ['sync', '/specorbit-sync-specs'],
      ['archive', '/specorbit-archive-change'],
      ['bulk-archive', '/specorbit-bulk-archive-change'],
      ['verify', '/specorbit-verify-change'],
      ['onboard', '/specorbit-onboard'],
      ['propose', '/specorbit-propose'],
    ];

    for (const [cmd, skillRef] of mappings) {
      it(`should transform /orbit:${cmd} to ${skillRef}`, () => {
        expect(transformToSkillReferences(`/orbit:${cmd}`)).toBe(skillRef);
      });
    }
  });

  describe('basic transformations', () => {
    it('should transform command reference in context', () => {
      const input = 'Use /orbit:apply to implement tasks';
      const expected = 'Use /specorbit-apply-change to implement tasks';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform multiple command references', () => {
      const input = 'Run /orbit:apply then /orbit:archive';
      const expected = 'Run /specorbit-apply-change then /specorbit-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should handle backtick-quoted commands', () => {
      const input = 'Run `/orbit:continue` to proceed';
      const expected = 'Run `/specorbit-continue-change` to proceed';
      expect(transformToSkillReferences(input)).toBe(expected);
    });

    it('should transform references across multiple lines', () => {
      const input = `Use /orbit:new to start
Then /orbit:apply to implement`;
      const expected = `Use /specorbit-new-change to start
Then /specorbit-apply-change to implement`;
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('should return unchanged text with no command references', () => {
      const input = 'This is plain text without commands';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(transformToSkillReferences('')).toBe('');
    });

    it('should leave unknown command references unchanged', () => {
      const input = 'Try /orbit:unknown-command here';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should not transform similar but non-matching patterns', () => {
      const input = '/ops:new orbit: /other:command';
      expect(transformToSkillReferences(input)).toBe(input);
    });

    it('should transform longest matching command (bulk-archive vs archive)', () => {
      const input = '/orbit:bulk-archive and /orbit:archive';
      const expected = '/specorbit-bulk-archive-change and /specorbit-archive-change';
      expect(transformToSkillReferences(input)).toBe(expected);
    });
  });
});

describe('getSkillReferenceTransformer', () => {
  it('uses the default /<name> form for tools without a custom prefix', () => {
    expect(getSkillReferenceTransformer('vibe')).toBe(transformToSkillReferences);
    expect(getSkillReferenceTransformer('hermes')('/orbit:apply')).toBe('/specorbit-apply-change');
  });

  it('uses /skill:<name> for Kimi Code, per its documented invocation syntax', () => {
    const transformer = getSkillReferenceTransformer('kimi');
    expect(transformer('/orbit:propose')).toBe('/skill:specorbit-propose');
    expect(transformer('Run `/orbit:apply` then /orbit:archive')).toBe(
      'Run `/skill:specorbit-apply-change` then /skill:specorbit-archive-change'
    );
    expect(transformer('/orbit:unknown-command')).toBe('/orbit:unknown-command');
  });

  it('uses $<name> for direct Codex invocation hints', () => {
    const transformer = getSkillReferenceTransformer('codex');
    expect(transformer('/orbit:propose')).toBe('$specorbit-propose');
    expect(transformer('/orbit:unknown-command')).toBe('/orbit:unknown-command');
  });

  it.each(['rovodev', 'codeassistant'])('uses natural-language skill references for %s', (toolId) => {
    const transformer = getSkillReferenceTransformer(toolId);
    expect(transformer('/orbit:propose')).toBe('the specorbit-propose skill');
    expect(transformer('Run `/orbit:apply` then /orbit:archive')).toBe(
      'Run `the specorbit-apply-change skill` then the specorbit-archive-change skill'
    );
    // No `/specorbit-*` or other slash-command form is ever emitted.
    expect(transformer('/orbit:propose')).not.toMatch(/\/specorbit-/);
    expect(transformer('/orbit:unknown-command')).toBe('/orbit:unknown-command');
  });
});

describe('getTransformerForTool', () => {
  it('selects skill references for skills-only delivery for every tool', () => {
    expect(getTransformerForTool('claude', 'skills', 'adapter-backed', NAMESPACED_SLASH)).toBe(
      transformToSkillReferences
    );
    // hyphen-command tools must not fall back to hyphen commands when no commands are generated
    expect(getTransformerForTool('opencode', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('pi', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('oh-my-pi', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
  });

  it('selects skill references for tools without a command surface, regardless of delivery', () => {
    // Tools like Kimi Code or Mistral Vibe have no command adapter, so their
    // skills must never reference /orbit:* commands that were not generated.
    expect(getTransformerForTool('vibe', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    expect(getTransformerForTool('hermes', 'both', 'none', undefined)).toBe(transformToSkillReferences);
    // Kimi Code documents /skill:<name> invocations (docs/supported-tools.md)
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('kimi', delivery, 'none', undefined);
      expect(transformer?.('/orbit:propose')).toBe('/skill:specorbit-propose');
    }
  });

  it('selects hyphen commands for every flat-invocation tool when commands are generated', () => {
    // These tools invoke commands by filename (/orbit-<id>), so skills must
    // reference the hyphen form their command files actually answer to.
    for (const toolId of ['bob', 'cursor', 'github-copilot', 'oh-my-pi', 'opencode', 'pi', 'qwen'] as const) {
      for (const delivery of ['both', 'commands'] as const) {
        const transformer = getTransformerForTool(toolId, delivery, 'adapter-backed', FLAT_SLASH);
        expect(transformer?.('/orbit:apply'), `${toolId} ${delivery}`).toBe('/orbit-apply');
      }
      // ...but must not fall back to hyphen commands when no commands are generated
      expect(getTransformerForTool(toolId, 'skills', 'adapter-backed', FLAT_SLASH)).toBe(transformToSkillReferences);
    }
  });

  it('selects skill references for devin whenever skills are generated', () => {
    // The Devin Local agent has no workflows, so Devin skill bodies and the
    // getting-started hint must name `/specorbit-*` skills, which both Devin
    // agents accept. Workflow bodies get the hyphen form from the generator,
    // like every other flat-invocation tool.
    expect(getTransformerForTool('devin', 'both', 'adapter-backed', FLAT_SLASH)).toBe(
      transformToSkillReferences
    );
    expect(getTransformerForTool('devin', 'skills', 'adapter-backed', FLAT_SLASH)).toBe(
      transformToSkillReferences
    );
    // Under commands-only delivery no Devin skills exist to point at, so the
    // hint falls back to the workflow name Devin registers.
    const commandsOnly = getTransformerForTool('devin', 'commands', 'adapter-backed', FLAT_SLASH);
    expect(commandsOnly?.('/orbit:propose')).toBe('/orbit-propose');
  });

  it("selects Amazon Q's @-prefixed prompt form when commands are generated", () => {
    // Amazon Q loads .amazonq/prompts/orbit-<id>.md into its prompt library,
    // which is invoked with @ — it registers no slash command at all.
    for (const delivery of ['both', 'commands'] as const) {
      const transformer = getTransformerForTool('amazon-q', delivery, 'adapter-backed', FLAT_AT);
      expect(transformer?.('/orbit:apply'), delivery).toBe('@orbit-apply');
      expect(transformer?.('Run /orbit:archive next'), delivery).toBe('Run @orbit-archive next');
    }
    // Skills-only delivery generates no prompt files, so point at the skill.
    expect(getTransformerForTool('amazon-q', 'skills', 'adapter-backed', FLAT_AT)).toBe(
      transformToSkillReferences
    );
  });

  it('selects no transformer for namespaced tools when commands are generated', () => {
    expect(getTransformerForTool('claude', 'both', 'adapter-backed', NAMESPACED_SLASH)).toBeUndefined();
    expect(getTransformerForTool('claude', 'commands', 'adapter-backed', NAMESPACED_SLASH)).toBeUndefined();
  });

  it('selects shared-tree-safe Codex skill references in every delivery mode', () => {
    // Codex needs $<name>, while generic consumers of the same canonical
    // .agents tree need /<name>. Keep both explicit so neither target breaks.
    for (const delivery of ['both', 'commands', 'skills'] as const) {
      const transformer = getTransformerForTool('codex', delivery, 'skills-invocable', undefined);
      expect(transformer?.('/orbit:propose')).toBe(
        '$specorbit-propose (Codex) or /specorbit-propose (other agents)'
      );
      expect(transformer?.('Run /orbit:apply next')).toBe(
        'Run $specorbit-apply-change (Codex) or /specorbit-apply-change (other agents) next'
      );
    }
  });
});

// Regression for #1153/#1514: the apply skill template must author its
// continue/apply/archive references as canonical /orbit:* tokens so the
// generator can rewrite them per target. Bare "specorbit-continue-change"
// prose is invisible to the transformers, which left skills.sh, Codex, and
// Kimi with dead text and no archive/input invocation after a naive revert.
describe('apply skill template generates valid per-target invocations', () => {
  const skill = getApplyChangeSkillTemplate().instructions;

  it('authors invocation references as transformable /orbit:* tokens', () => {
    expect(skill).toContain('/orbit:apply add-auth');
    expect(skill).toContain('suggest using `/orbit:continue`');
    expect(skill).toContain('archive this change with `/orbit:archive`');
    // No bare, non-transformable skill-name prose remains.
    expect(skill).not.toContain('suggest using specorbit-continue-change');
  });

  const cases = [
    { tool: 'default (skills.sh)', transform: transformToSkillReferences, cont: '/specorbit-continue-change', arch: '/specorbit-archive-change', apply: '/specorbit-apply-change' },
    { tool: 'codex', transform: getSkillReferenceTransformer('codex'), cont: '$specorbit-continue-change', arch: '$specorbit-archive-change', apply: '$specorbit-apply-change' },
    { tool: 'kimi', transform: getSkillReferenceTransformer('kimi'), cont: '/skill:specorbit-continue-change', arch: '/skill:specorbit-archive-change', apply: '/skill:specorbit-apply-change' },
  ];

  for (const { tool, transform, cont, arch, apply } of cases) {
    it(`emits ${tool} skill invocations for continue, apply, and archive`, () => {
      const out = transform(skill);
      expect(out).toContain(cont);
      expect(out).toContain(arch);
      expect(out).toContain(`${apply} add-auth`);
      // No canonical token survives the rewrite.
      expect(out).not.toMatch(/\/orbit:(continue|apply|archive)/);
    });
  }
});
