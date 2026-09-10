import { describe, expect, it } from 'vitest';
import { isLegacyCodexSkillEquivalentToCurrent } from '../../../src/core/shared/skill-content-equivalence.js';

describe('legacy Codex skill equivalence', () => {
  it('accepts generated version, BOM, CRLF, and known dual-reference differences', () => {
    const legacy =
      '\uFEFF---\r\nmetadata:\r\n  generatedBy: "0.1.0"\r\n---\r\nUse $specorbit-apply-change.\r\n';
    const current =
      '---\nmetadata:\n  generatedBy: "1.7.0-beta.1+build.5"\n---\nUse $specorbit-apply-change (Codex) or /specorbit-apply-change (other agents).\n';

    expect(isLegacyCodexSkillEquivalentToCurrent(legacy, current)).toBe(true);
  });

  it('preserves custom invocation examples', () => {
    const legacy =
      '---\nmetadata:\n  generatedBy: "1.0.0"\n---\nUse $specorbit-personal.\n';
    const current =
      '---\nmetadata:\n  generatedBy: "1.0.0"\n---\nUse $specorbit-personal (Codex) or /specorbit-personal (other agents).\n';

    expect(isLegacyCodexSkillEquivalentToCurrent(legacy, current)).toBe(false);
  });

  it('preserves non-version generatedBy values', () => {
    const legacy = '---\nmetadata:\n  generatedBy: "custom-a"\n---\nSame body.\n';
    const current = '---\nmetadata:\n  generatedBy: "custom-b"\n---\nSame body.\n';

    expect(isLegacyCodexSkillEquivalentToCurrent(legacy, current)).toBe(false);
  });

  it.each([
    '1.0.0-preview.',
    '1.0.0+build.',
    '1.0.0-.',
    '1.0.0+.',
    '1.0.0-alpha..1',
    '01.0.0',
    '1.01.0',
    '1.0.01',
    '1.0.0-01',
  ])('preserves malformed generatedBy version %s', (version) => {
    const legacy = `---\nmetadata:\n  generatedBy: "${version}"\n---\nSame body.\n`;
    const current = '---\nmetadata:\n  generatedBy: "1.0.0"\n---\nSame body.\n';

    expect(isLegacyCodexSkillEquivalentToCurrent(legacy, current)).toBe(false);
  });

  it('preserves mismatched generatedBy quotes', () => {
    const legacy = `---\nmetadata:\n  generatedBy: "1.0.0'\n---\nSame body.\n`;
    const current = '---\nmetadata:\n  generatedBy: "1.0.0"\n---\nSame body.\n';

    expect(isLegacyCodexSkillEquivalentToCurrent(legacy, current)).toBe(false);
  });
});
