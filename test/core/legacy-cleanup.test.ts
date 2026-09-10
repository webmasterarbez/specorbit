import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import {
  detectLegacyArtifacts,
  detectLegacyConfigFiles,
  detectLegacySlashCommands,
  detectLegacyStructureFiles,
  getCodexPromptDir,
  hasSpecOrbitMarkers,
  isOnlySpecOrbitContent,
  removeMarkerBlock,
  cleanupLegacyArtifacts,
  formatDeferredGlobalPromptSummary,
  formatCleanupSummary,
  formatDetectionSummary,
  formatProjectMdMigrationHint,
  getToolsFromLegacyArtifacts,
  omitToolLegacyArtifacts,
  LEGACY_CONFIG_FILES,
  LEGACY_GLOBAL_SLASH_COMMAND_PATHS,
  LEGACY_SLASH_COMMAND_PATHS,
} from '../../src/core/legacy-cleanup.js';
import { SPECORBIT_MARKERS } from '../../src/core/config.js';
import { CommandAdapterRegistry } from '../../src/core/command-generation/registry.js';
import { resolveCommandSurfaceCapability } from '../../src/core/command-surface.js';
import { ALL_WORKFLOWS } from '../../src/core/profiles.js';

describe('legacy-cleanup', () => {
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'specorbit-legacy-test-'));
    process.env.CODEX_HOME = path.join(testDir, 'codex-home');
    // Create specorbit directory structure
    await fs.mkdir(path.join(testDir, 'specorbit'), { recursive: true });
  });

  afterEach(async () => {
    process.env = originalEnv;
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('hasSpecOrbitMarkers', () => {
    it('should return true when both markers are present', () => {
      const content = `Some content
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}
More content`;
      expect(hasSpecOrbitMarkers(content)).toBe(true);
    });

    it('should return false when start marker is missing', () => {
      const content = `Some content
SpecOrbit content
${SPECORBIT_MARKERS.end}`;
      expect(hasSpecOrbitMarkers(content)).toBe(false);
    });

    it('should return false when end marker is missing', () => {
      const content = `${SPECORBIT_MARKERS.start}
SpecOrbit content
Some content`;
      expect(hasSpecOrbitMarkers(content)).toBe(false);
    });

    it('should return false when no markers are present', () => {
      const content = 'Plain content without markers';
      expect(hasSpecOrbitMarkers(content)).toBe(false);
    });
  });

  describe('isOnlySpecOrbitContent', () => {
    it('should return true when content is only markers and whitespace outside', () => {
      const content = `${SPECORBIT_MARKERS.start}
SpecOrbit content here
${SPECORBIT_MARKERS.end}`;
      expect(isOnlySpecOrbitContent(content)).toBe(true);
    });

    it('should return true with whitespace before and after markers', () => {
      const content = `

${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}

`;
      expect(isOnlySpecOrbitContent(content)).toBe(true);
    });

    it('should return false when content exists before markers', () => {
      const content = `User content here
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`;
      expect(isOnlySpecOrbitContent(content)).toBe(false);
    });

    it('should return false when content exists after markers', () => {
      const content = `${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}
User content here`;
      expect(isOnlySpecOrbitContent(content)).toBe(false);
    });

    it('should return false when markers are missing', () => {
      const content = 'Plain content without markers';
      expect(isOnlySpecOrbitContent(content)).toBe(false);
    });

    it('should return false when end marker comes before start marker', () => {
      const content = `${SPECORBIT_MARKERS.end}
Content
${SPECORBIT_MARKERS.start}`;
      expect(isOnlySpecOrbitContent(content)).toBe(false);
    });
  });

  describe('removeMarkerBlock', () => {
    it('should remove marker block and preserve content before', () => {
      const content = `User content before
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`;
      const result = removeMarkerBlock(content);
      expect(result).toBe('User content before\n');
      expect(result).not.toContain(SPECORBIT_MARKERS.start);
      expect(result).not.toContain(SPECORBIT_MARKERS.end);
    });

    it('should remove marker block and preserve content after', () => {
      const content = `${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}
User content after`;
      const result = removeMarkerBlock(content);
      expect(result).toBe('User content after\n');
    });

    it('should remove marker block and preserve content before and after', () => {
      const content = `User content before
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}
User content after`;
      const result = removeMarkerBlock(content);
      expect(result).toContain('User content before');
      expect(result).toContain('User content after');
      expect(result).not.toContain(SPECORBIT_MARKERS.start);
    });

    it('should clean up double blank lines', () => {
      const content = `Line 1


${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}


Line 2`;
      const result = removeMarkerBlock(content);
      expect(result).not.toMatch(/\n{3,}/);
    });

    it('should return empty string when only markers remain', () => {
      const content = `${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`;
      const result = removeMarkerBlock(content);
      expect(result).toBe('');
    });

    it('should return original content when markers are missing', () => {
      const content = 'Plain content without markers';
      const result = removeMarkerBlock(content);
      // When no markers found, content is returned trimmed (no trailing newline added)
      expect(result).toBe('Plain content without markers');
    });

    it('should return original content when markers are in wrong order', () => {
      const content = `${SPECORBIT_MARKERS.end}
Content
${SPECORBIT_MARKERS.start}`;
      const result = removeMarkerBlock(content);
      expect(result).toContain(SPECORBIT_MARKERS.end);
      expect(result).toContain(SPECORBIT_MARKERS.start);
    });

    it('should ignore inline mentions of markers and only remove actual block', () => {
      const content = `Intro referencing ${SPECORBIT_MARKERS.start} and ${SPECORBIT_MARKERS.end} inline.

${SPECORBIT_MARKERS.start}
Managed content here
${SPECORBIT_MARKERS.end}
After content`;
      const result = removeMarkerBlock(content);
      // Inline mentions preserved
      expect(result).toContain('Intro referencing');
      expect(result).toContain(SPECORBIT_MARKERS.start);
      expect(result).toContain(SPECORBIT_MARKERS.end);
      // Managed content removed
      expect(result).not.toContain('Managed content here');
      expect(result).toContain('After content');
    });
  });

  describe('detectLegacyConfigFiles', () => {
    it('should detect CLAUDE.md with SpecOrbit markers and put in update list', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`);

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toContain('CLAUDE.md');
      // Config files are NEVER deleted, always updated (markers removed)
      expect(result.filesToUpdate).toContain('CLAUDE.md');
    });

    it('should detect files with mixed content and put in update list', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `User instructions here
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`);

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toContain('CLAUDE.md');
      expect(result.filesToUpdate).toContain('CLAUDE.md');
    });

    it('should not detect files without SpecOrbit markers', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, 'Plain instructions without markers');

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).not.toContain('CLAUDE.md');
    });

    it('should detect multiple config files', async () => {
      // Create multiple config files with markers
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), `${SPECORBIT_MARKERS.start}\nContent\n${SPECORBIT_MARKERS.end}`);
      await fs.writeFile(path.join(testDir, 'CLINE.md'), `${SPECORBIT_MARKERS.start}\nContent\n${SPECORBIT_MARKERS.end}`);
      await fs.writeFile(path.join(testDir, 'QODER.md'), `${SPECORBIT_MARKERS.start}\nContent\n${SPECORBIT_MARKERS.end}`);

      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toHaveLength(3);
      expect(result.allFiles).toContain('CLAUDE.md');
      expect(result.allFiles).toContain('CLINE.md');
      expect(result.allFiles).toContain('QODER.md');
      // All should be in update list, none deleted
      expect(result.filesToUpdate).toHaveLength(3);
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await detectLegacyConfigFiles(testDir);
      expect(result.allFiles).toHaveLength(0);
      expect(result.filesToUpdate).toHaveLength(0);
    });
  });

  describe('detectLegacySlashCommands', () => {
    it('should detect legacy Claude slash command directory', async () => {
      const dirPath = path.join(testDir, '.claude', 'commands', 'specorbit');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'proposal.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.directories).toContain('.claude/commands/specorbit');
    });

    it('should detect legacy Cursor slash command files', async () => {
      const dirPath = path.join(testDir, '.cursor', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'specorbit-proposal.md'), 'content');
      await fs.writeFile(path.join(dirPath, 'specorbit-apply.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.cursor/commands/specorbit-proposal.md');
      expect(result.files).toContain('.cursor/commands/specorbit-apply.md');
    });

    it('should detect legacy Windsurf workflow files', async () => {
      const dirPath = path.join(testDir, '.windsurf', 'workflows');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'specorbit-archive.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.windsurf/workflows/specorbit-archive.md');
    });

    it('should detect multiple tool directories and files', async () => {
      // Create directory-based
      await fs.mkdir(path.join(testDir, '.claude', 'commands', 'specorbit'), { recursive: true });
      await fs.mkdir(path.join(testDir, '.qoder', 'commands', 'specorbit'), { recursive: true });

      // Create file-based
      await fs.mkdir(path.join(testDir, '.cursor', 'commands'), { recursive: true });
      await fs.writeFile(path.join(testDir, '.cursor', 'commands', 'specorbit-proposal.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.directories).toContain('.claude/commands/specorbit');
      expect(result.directories).toContain('.qoder/commands/specorbit');
      expect(result.files).toContain('.cursor/commands/specorbit-proposal.md');
    });

    it('should not detect non-specorbit files', async () => {
      const dirPath = path.join(testDir, '.cursor', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'other-command.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).not.toContain('.cursor/commands/other-command.md');
    });

    it('should handle non-existent directories gracefully', async () => {
      const result = await detectLegacySlashCommands(testDir);
      expect(result.directories).toHaveLength(0);
      expect(result.files).toHaveLength(0);
    });

    it('should detect TOML-based slash commands for Qwen', async () => {
      const dirPath = path.join(testDir, '.qwen', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'specorbit-proposal.toml'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.qwen/commands/specorbit-proposal.toml');
    });

    it('should detect deprecated orbit TOML commands for Qwen', async () => {
      const dirPath = path.join(testDir, '.qwen', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'orbit-explore.toml'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.qwen/commands/orbit-explore.toml');
    });

    it('should not detect new Markdown commands for Qwen as legacy', async () => {
      const dirPath = path.join(testDir, '.qwen', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'orbit-explore.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).not.toContain('.qwen/commands/orbit-explore.md');
    });

    it('should detect Continue prompt files', async () => {
      const dirPath = path.join(testDir, '.continue', 'prompts');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'specorbit-apply.prompt'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.continue/prompts/specorbit-apply.prompt');
    });

    it('should detect legacy OpenCode orbit-* command files', async () => {
      const dirPath = path.join(testDir, '.opencode', 'command');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'orbit-propose.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.opencode/command/orbit-propose.md');
    });

    it('should detect legacy OpenCode specorbit-* command files', async () => {
      const dirPath = path.join(testDir, '.opencode', 'command');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'specorbit-new.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.opencode/command/specorbit-new.md');
    });

    it('should detect both orbit-* and specorbit-* OpenCode command files', async () => {
      const dirPath = path.join(testDir, '.opencode', 'command');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'orbit-propose.md'), 'content');
      await fs.writeFile(path.join(dirPath, 'specorbit-new.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.opencode/command/orbit-propose.md');
      expect(result.files).toContain('.opencode/command/specorbit-new.md');
    });

    it('should detect legacy CoStrict command files without claiming their directory', async () => {
      const dirPath = path.join(testDir, '.cospec', 'specorbit', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'specorbit-proposal.md'), 'content');
      await fs.writeFile(path.join(dirPath, 'specorbit-apply.md'), 'content');
      await fs.writeFile(path.join(dirPath, 'specorbit-archive.md'), 'content');

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toContain('.cospec/specorbit/commands/specorbit-proposal.md');
      expect(result.files).toContain('.cospec/specorbit/commands/specorbit-apply.md');
      expect(result.files).toContain('.cospec/specorbit/commands/specorbit-archive.md');
      expect(result.directories).not.toContain('.cospec/specorbit/commands');
    });

    it('should not report any file a current command adapter writes as a legacy artifact', async () => {
      // Codex is the only legacy tool id with no adapter, so it is the only
      // entry with no current output for this invariant to compare against.
      const withoutAdapter = Object.keys(LEGACY_SLASH_COMMAND_PATHS).filter(
        (toolId) => !CommandAdapterRegistry.has(toolId)
      );
      expect(withoutAdapter).toEqual(['codex']);

      const currentFiles = CommandAdapterRegistry.getAll().flatMap((adapter) =>
        ALL_WORKFLOWS.map((workflowId) => adapter.getFilePath(workflowId))
      );
      expect(currentFiles.every((filePath) => !path.isAbsolute(filePath))).toBe(true);

      for (const relativePath of currentFiles) {
        const filePath = path.join(testDir, relativePath);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, 'current command output');
      }

      const result = await detectLegacySlashCommands(testDir);
      expect(result.files).toEqual([]);
      expect(result.directories).toEqual([]);
    });

    it('should not include managed global Codex prompt files in repo-local slash command detection', async () => {
      const promptDir = getCodexPromptDir();
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(path.join(promptDir, 'orbit-explore.md'), 'legacy explore prompt');
      await fs.writeFile(path.join(promptDir, 'specorbit-proposal.md'), 'managed');
      await fs.writeFile(path.join(promptDir, 'my-custom-prompt.md'), 'user');

      const result = await detectLegacySlashCommands(testDir);

      expect(result.files).not.toContain(path.join(promptDir, 'orbit-explore.md'));
      expect(result.files).not.toContain(path.join(promptDir, 'specorbit-proposal.md'));
      expect(result.files).not.toContain(path.join(promptDir, 'my-custom-prompt.md'));
    });
  });

  describe('detectLegacyStructureFiles', () => {
    it('should detect specorbit/AGENTS.md', async () => {
      const agentsPath = path.join(testDir, 'specorbit', 'AGENTS.md');
      await fs.writeFile(agentsPath, '# AGENTS.md content');

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasSpecorbitAgents).toBe(true);
    });

    it('should detect specorbit/project.md', async () => {
      const projectPath = path.join(testDir, 'specorbit', 'project.md');
      await fs.writeFile(projectPath, '# Project content');

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasProjectMd).toBe(true);
    });

    it('should detect root AGENTS.md with SpecOrbit markers', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, `${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`);

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasRootAgentsWithMarkers).toBe(true);
    });

    it('should not detect root AGENTS.md without markers', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, 'Plain content without markers');

      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasRootAgentsWithMarkers).toBe(false);
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await detectLegacyStructureFiles(testDir);
      expect(result.hasSpecorbitAgents).toBe(false);
      expect(result.hasProjectMd).toBe(false);
      expect(result.hasRootAgentsWithMarkers).toBe(false);
    });
  });

  describe('detectLegacyArtifacts', () => {
    it('should return hasLegacyArtifacts: false when nothing is found', async () => {
      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(false);
    });

    it('should return hasLegacyArtifacts: true when config files are found', async () => {
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), `${SPECORBIT_MARKERS.start}\nContent\n${SPECORBIT_MARKERS.end}`);

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.configFiles).toContain('CLAUDE.md');
    });

    it('should return hasLegacyArtifacts: true when slash commands are found', async () => {
      await fs.mkdir(path.join(testDir, '.claude', 'commands', 'specorbit'), { recursive: true });

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.slashCommandDirs).toContain('.claude/commands/specorbit');
    });

    it('should return hasLegacyArtifacts: true when specorbit/AGENTS.md is found', async () => {
      await fs.writeFile(path.join(testDir, 'specorbit', 'AGENTS.md'), 'content');

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.hasSpecorbitAgents).toBe(true);
    });

    it('should detect project.md for migration hint (it is preserved, not deleted)', async () => {
      await fs.writeFile(path.join(testDir, 'specorbit', 'project.md'), 'content');

      const result = await detectLegacyArtifacts(testDir);
      // project.md triggers hasLegacyArtifacts to show migration hint
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.hasProjectMd).toBe(true);
    });

    it('should combine all detection results', async () => {
      // Create various legacy artifacts
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), `${SPECORBIT_MARKERS.start}\nContent\n${SPECORBIT_MARKERS.end}`);
      await fs.mkdir(path.join(testDir, '.claude', 'commands', 'specorbit'), { recursive: true });
      await fs.writeFile(path.join(testDir, 'specorbit', 'AGENTS.md'), 'content');
      await fs.writeFile(path.join(testDir, 'specorbit', 'project.md'), 'content');

      const result = await detectLegacyArtifacts(testDir);
      expect(result.hasLegacyArtifacts).toBe(true);
      expect(result.configFiles).toContain('CLAUDE.md');
      expect(result.slashCommandDirs).toContain('.claude/commands/specorbit');
      expect(result.hasSpecorbitAgents).toBe(true);
      expect(result.hasProjectMd).toBe(true);
    });

    it('should detect allowlisted global Codex prompts separately from repo-local slash commands', async () => {
      const promptDir = getCodexPromptDir();
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(path.join(promptDir, 'orbit-explore.md'), 'prompt generated by an older SpecOrbit version');
      await fs.writeFile(path.join(promptDir, 'orbit-update.md'), 'legacy update prompt');
      await fs.writeFile(path.join(promptDir, 'orbit-review.md'), 'user');
      await fs.writeFile(path.join(promptDir, 'specorbit-proposal.md'), 'managed');
      await fs.writeFile(path.join(promptDir, 'my-custom-prompt.md'), 'user');

      const result = await detectLegacyArtifacts(testDir);

      expect(result.globalSlashCommandFiles).toContain(path.join(promptDir, 'orbit-explore.md'));
      expect(result.globalSlashCommandFiles).toContain(path.join(promptDir, 'orbit-update.md'));
      expect(result.globalSlashCommandFiles).not.toContain(path.join(promptDir, 'orbit-review.md'));
      expect(result.globalSlashCommandFiles).not.toContain(path.join(promptDir, 'specorbit-proposal.md'));
      expect(result.globalSlashCommandFiles).not.toContain(path.join(promptDir, 'my-custom-prompt.md'));
      expect(result.slashCommandFiles).not.toContain(path.join(promptDir, 'orbit-explore.md'));
    });

    it('should detect exact allowlisted global Codex filenames regardless of template revision', async () => {
      const promptDir = getCodexPromptDir();
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(
        path.join(promptDir, 'orbit-explore.md'),
        '# custom explore prompt\n\nThis is not a SpecOrbit generated Codex prompt.\n'
      );

      const result = await detectLegacyArtifacts(testDir);

      expect(result.globalSlashCommandFiles).toContain(path.join(promptDir, 'orbit-explore.md'));
    });
  });

  describe('cleanupLegacyArtifacts', () => {
    it('should remove markers from config files that have only SpecOrbit content (never delete)', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `${SPECORBIT_MARKERS.start}\nContent\n${SPECORBIT_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      // Config files should NEVER be deleted, only have markers removed
      expect(result.deletedFiles).not.toContain('CLAUDE.md');
      expect(result.modifiedFiles).toContain('CLAUDE.md');
      // File should still exist
      await expect(fs.access(claudePath)).resolves.not.toThrow();
      // File should be empty or have markers removed
      const content = await fs.readFile(claudePath, 'utf-8');
      expect(content).not.toContain(SPECORBIT_MARKERS.start);
      expect(content).not.toContain(SPECORBIT_MARKERS.end);
    });

    it('should remove marker block from files with mixed content', async () => {
      const claudePath = path.join(testDir, 'CLAUDE.md');
      await fs.writeFile(claudePath, `User instructions
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.modifiedFiles).toContain('CLAUDE.md');
      const content = await fs.readFile(claudePath, 'utf-8');
      expect(content).toContain('User instructions');
      expect(content).not.toContain(SPECORBIT_MARKERS.start);
    });

    it('should delete legacy slash command directories', async () => {
      const dirPath = path.join(testDir, '.claude', 'commands', 'specorbit');
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(path.join(dirPath, 'proposal.md'), 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedDirs).toContain('.claude/commands/specorbit');
      await expect(fs.access(dirPath)).rejects.toThrow();
      // Parent directory should still exist
      await expect(fs.access(path.join(testDir, '.claude', 'commands'))).resolves.not.toThrow();
    });

    it('should delete legacy slash command files', async () => {
      const dirPath = path.join(testDir, '.cursor', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      const filePath = path.join(dirPath, 'specorbit-proposal.md');
      await fs.writeFile(filePath, 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain('.cursor/commands/specorbit-proposal.md');
      await expect(fs.access(filePath)).rejects.toThrow();
    });

    it('should delete legacy CoStrict command files without emptying their directory', async () => {
      const dirPath = path.join(testDir, '.cospec', 'specorbit', 'commands');
      await fs.mkdir(dirPath, { recursive: true });
      const legacyFile = path.join(dirPath, 'specorbit-proposal.md');
      const currentFile = path.join(dirPath, 'orbit-propose.md');
      const userFile = path.join(dirPath, 'my-team-command.md');
      await fs.writeFile(legacyFile, 'content');
      await fs.writeFile(currentFile, 'content');
      await fs.writeFile(userFile, 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain('.cospec/specorbit/commands/specorbit-proposal.md');
      expect(result.deletedDirs).not.toContain('.cospec/specorbit/commands');
      await expect(fs.access(legacyFile)).rejects.toThrow();
      await expect(fs.access(currentFile)).resolves.not.toThrow();
      await expect(fs.access(userFile)).resolves.not.toThrow();
    });

    it('should delete specorbit/AGENTS.md', async () => {
      const agentsPath = path.join(testDir, 'specorbit', 'AGENTS.md');
      await fs.writeFile(agentsPath, 'content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain('specorbit/AGENTS.md');
      await expect(fs.access(agentsPath)).rejects.toThrow();
      // specorbit directory should still exist
      await expect(fs.access(path.join(testDir, 'specorbit'))).resolves.not.toThrow();
    });

    it('should NOT delete specorbit/project.md', async () => {
      const projectPath = path.join(testDir, 'specorbit', 'project.md');
      await fs.writeFile(projectPath, 'User project content');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.projectMdNeedsMigration).toBe(true);
      expect(result.deletedFiles).not.toContain('specorbit/project.md');
      await expect(fs.access(projectPath)).resolves.not.toThrow();
    });

    it('should handle root AGENTS.md with mixed content', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, `User content
${SPECORBIT_MARKERS.start}
SpecOrbit content
${SPECORBIT_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.modifiedFiles).toContain('AGENTS.md');
      const content = await fs.readFile(agentsPath, 'utf-8');
      expect(content).toContain('User content');
      expect(content).not.toContain(SPECORBIT_MARKERS.start);
    });

    it('should remove markers from root AGENTS.md even when only SpecOrbit content (never delete)', async () => {
      const agentsPath = path.join(testDir, 'AGENTS.md');
      await fs.writeFile(agentsPath, `${SPECORBIT_MARKERS.start}\nSpecOrbit content\n${SPECORBIT_MARKERS.end}`);

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      // Root AGENTS.md should NEVER be deleted, only have markers removed
      expect(result.deletedFiles).not.toContain('AGENTS.md');
      expect(result.modifiedFiles).toContain('AGENTS.md');
      // File should still exist
      await expect(fs.access(agentsPath)).resolves.not.toThrow();
    });

    it('should report errors without stopping cleanup', async () => {
      // Create a valid detection result with a non-existent file to simulate error
      const detection = {
        configFiles: ['NON_EXISTENT.md'],
        configFilesToUpdate: ['NON_EXISTENT.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const result = await cleanupLegacyArtifacts(testDir, detection);

      // Should not throw, but should record the error
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('NON_EXISTENT.md');
    });

    it('should remove allowlisted global Codex prompts and preserve unmanaged prompts', async () => {
      const promptDir = getCodexPromptDir();
      const managedPrompt = path.join(promptDir, 'orbit-apply.md');
      const customOrbitPrompt = path.join(promptDir, 'orbit-review.md');
      const legacyPrompt = path.join(promptDir, 'specorbit-proposal.md');
      const unmanagedPrompt = path.join(promptDir, 'personal.md');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(managedPrompt, 'legacy apply prompt');
      await fs.writeFile(customOrbitPrompt, 'user');
      await fs.writeFile(legacyPrompt, 'managed');
      await fs.writeFile(unmanagedPrompt, 'user');

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain(managedPrompt);
      expect(result.deletedFiles).not.toContain(legacyPrompt);
      expect(result.deletedFiles).not.toContain(customOrbitPrompt);
      await expect(fs.access(managedPrompt)).rejects.toThrow();
      await expect(fs.access(customOrbitPrompt)).resolves.not.toThrow();
      await expect(fs.access(legacyPrompt)).resolves.not.toThrow();
      await expect(fs.access(unmanagedPrompt)).resolves.not.toThrow();
    });

    it('should remove exact allowlisted global Codex filenames when their content differs', async () => {
      const promptDir = getCodexPromptDir();
      const customizedManagedName = path.join(promptDir, 'orbit-apply.md');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(
        customizedManagedName,
        '# customized legacy apply prompt\n'
      );

      const detection = await detectLegacyArtifacts(testDir);
      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain(customizedManagedName);
      await expect(fs.access(customizedManagedName)).rejects.toThrow();
    });

    it('should skip unmanaged global prompt paths in stale detection objects', async () => {
      const promptDir = getCodexPromptDir();
      const managedPrompt = path.join(promptDir, 'orbit-apply.md');
      const unmanagedPrompt = path.join(promptDir, 'personal.md');
      const outsidePrompt = path.join(testDir, 'other-codex-home', 'prompts', 'orbit-apply.md');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.mkdir(path.dirname(outsidePrompt), { recursive: true });
      await fs.writeFile(managedPrompt, 'legacy apply prompt');
      await fs.writeFile(unmanagedPrompt, 'user');
      await fs.writeFile(outsidePrompt, 'outside configured Codex prompt directory');

      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [managedPrompt, unmanagedPrompt, outsidePrompt],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const result = await cleanupLegacyArtifacts(testDir, detection);

      expect(result.deletedFiles).toContain(managedPrompt);
      expect(result.deletedFiles).not.toContain(unmanagedPrompt);
      expect(result.deletedFiles).not.toContain(outsidePrompt);
      expect(result.errors).toContain(`Skipped unmanaged global prompt ${unmanagedPrompt}`);
      expect(result.errors).toContain(`Skipped unmanaged global prompt ${outsidePrompt}`);
      await expect(fs.access(managedPrompt)).rejects.toThrow();
      await expect(fs.access(unmanagedPrompt)).resolves.not.toThrow();
      await expect(fs.access(outsidePrompt)).resolves.not.toThrow();
    });
  });

  describe('formatCleanupSummary', () => {
    it('should format deleted files', () => {
      const result = {
        deletedFiles: ['CLAUDE.md', 'CLINE.md'],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('Cleaned up legacy files:');
      expect(summary).toContain('✓ Removed CLAUDE.md');
      expect(summary).toContain('✓ Removed CLINE.md');
    });

    it('should format deleted directories', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: ['.claude/commands/specorbit'],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('✓ Removed .claude/commands/specorbit/ (replaced by SpecOrbit skills and commands)');
    });

    it('should format modified files', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: ['AGENTS.md'],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('✓ Removed SpecOrbit markers from AGENTS.md');
    });

    it('should include migration hint for project.md', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: true,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('Needs your attention');
      expect(summary).toContain('specorbit/project.md');
      expect(summary).toContain('config.yaml');
    });

    it('should include errors', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: ['Failed to delete CLAUDE.md: Permission denied'],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toContain('Errors during cleanup:');
      expect(summary).toContain('Failed to delete CLAUDE.md');
    });

    it('should return empty string when nothing to report', () => {
      const result = {
        deletedFiles: [],
        modifiedFiles: [],
        deletedDirs: [],
        projectMdNeedsMigration: false,
        errors: [],
      };

      const summary = formatCleanupSummary(result);
      expect(summary).toBe('');
    });
  });

  describe('formatDetectionSummary', () => {
    it('should include welcoming upgrade header and explanation', () => {
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Upgrading to the new SpecOrbit');
      expect(summary).toContain('agent skills');
      expect(summary).toContain('keeping everything working');
    });

    it('should format config files as files to update (never remove)', () => {
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      // Config files should be in "Files to update", not "Files to remove"
      expect(summary).toContain('Files to update');
      expect(summary).toContain('• CLAUDE.md');
      // Should NOT be in removals
      expect(summary).not.toContain('No user content to preserve');
    });

    it('should format files to be updated', () => {
      const detection = {
        configFiles: ['CLINE.md'],
        configFilesToUpdate: ['CLINE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to update');
      expect(summary).toContain('markers will be removed');
      expect(summary).toContain('your content preserved');
      expect(summary).toContain('• CLINE.md');
    });

    it('should format slash command directories', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: ['.claude/commands/specorbit'],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('• .claude/commands/specorbit/');
    });

    it('should format slash command files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.cursor/commands/specorbit-proposal.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('• .cursor/commands/specorbit-proposal.md');
    });

    it('should format specorbit/AGENTS.md', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: true,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('• specorbit/AGENTS.md');
    });

    it('should include attention section for project.md', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: true,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: false,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toContain('Needs your attention');
      expect(summary).toContain('• specorbit/project.md');
      expect(summary).toContain('won\'t delete this file');
      expect(summary).toContain('config.yaml');
      expect(summary).toContain('"context:"');
    });

    it('should include attention section with other legacy artifacts', () => {
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: true,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      // Config files now in "Files to update", not "Files to remove"
      expect(summary).toContain('Files to update');
      expect(summary).toContain('CLAUDE.md');
      expect(summary).toContain('Needs your attention');
      expect(summary).toContain('specorbit/project.md');
    });

    it('should group both removals and updates correctly', () => {
      const detection = {
        configFiles: ['CLAUDE.md', 'CLINE.md'],
        configFilesToUpdate: ['CLAUDE.md', 'CLINE.md'],
        slashCommandDirs: ['.claude/commands/specorbit'],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: true,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDetectionSummary(detection);
      // Check both sections exist
      expect(summary).toContain('Files to remove');
      expect(summary).toContain('Files to update');
      // Check removals (only slash commands and specorbit/AGENTS.md)
      expect(summary).toContain('• .claude/commands/specorbit/');
      expect(summary).toContain('• specorbit/AGENTS.md');
      // Check updates (all config files)
      expect(summary).toContain('• CLAUDE.md');
      expect(summary).toContain('• CLINE.md');
    });

    it('should format deferred global prompts cleanup separately from repo-local files', () => {
      const globalPrompt = path.join(getCodexPromptDir(), 'orbit-explore.md');
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [globalPrompt],
        globalSlashCommandDetails: [{
          path: globalPrompt,
          toolId: 'codex',
          managedFileName: 'orbit-explore.md',
          workflowIds: ['explore'],
          replacementLabel: 'Codex skills',
        }],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const summary = formatDeferredGlobalPromptSummary(detection);
      expect(summary).toContain('Deferred global prompts cleanup');
      expect(summary).toContain('These global prompts will only be removed after matching replacement skills are installed');
      expect(summary).toContain(`codex: ${globalPrompt}`);
      expect(summary).toContain(globalPrompt);
    });

    it('should return empty string when nothing is detected', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: false,
      };

      const summary = formatDetectionSummary(detection);
      expect(summary).toBe('');
    });
  });

  describe('formatProjectMdMigrationHint', () => {
    it('should return migration hint message', () => {
      const hint = formatProjectMdMigrationHint();
      expect(hint).toContain('Needs your attention');
      expect(hint).toContain('specorbit/project.md');
      expect(hint).toContain('won\'t delete this file');
      expect(hint).toContain('config.yaml');
      expect(hint).toContain('"context:"');
    });

    it('should include actionable instructions', () => {
      const hint = formatProjectMdMigrationHint();
      expect(hint).toContain('move any useful content');
      expect(hint).toContain('delete the file when ready');
    });

    it('should explain the new context section benefits', () => {
      const hint = formatProjectMdMigrationHint();
      expect(hint).toContain('included in every SpecOrbit request');
      expect(hint).toContain('reliably');
    });
  });

  describe('LEGACY_CONFIG_FILES', () => {
    it('should include expected config file names', () => {
      expect(LEGACY_CONFIG_FILES).toContain('CLAUDE.md');
      expect(LEGACY_CONFIG_FILES).toContain('CLINE.md');
      expect(LEGACY_CONFIG_FILES).toContain('CODEBUDDY.md');
      expect(LEGACY_CONFIG_FILES).toContain('COSTRICT.md');
      expect(LEGACY_CONFIG_FILES).toContain('QODER.md');
      expect(LEGACY_CONFIG_FILES).toContain('IFLOW.md');
      expect(LEGACY_CONFIG_FILES).toContain('AGENTS.md');
      expect(LEGACY_CONFIG_FILES).toContain('QWEN.md');
    });
  });

  describe('LEGACY_SLASH_COMMAND_PATHS', () => {
    it('should include expected tool patterns', () => {
      expect(LEGACY_SLASH_COMMAND_PATHS['claude']).toEqual({
        type: 'directory',
        path: '.claude/commands/specorbit',
      });

      expect(LEGACY_SLASH_COMMAND_PATHS['cursor']).toEqual({
        type: 'files',
        pattern: '.cursor/commands/specorbit-*.md',
      });

      expect(LEGACY_SLASH_COMMAND_PATHS['devin']).toEqual({
        type: 'files',
        pattern: '.windsurf/workflows/specorbit-*.md',
      });
    });

    it('should only include legacy tool IDs with a command surface capability', () => {
      const registeredTools = new Set(CommandAdapterRegistry.getAll().map(adapter => adapter.toolId));

      for (const tool of Object.keys(LEGACY_SLASH_COMMAND_PATHS)) {
        expect(registeredTools.has(tool) || resolveCommandSurfaceCapability(tool) === 'skills-invocable').toBe(true);
      }

      // Pi was never a pre-1.0 legacy tool
      expect(LEGACY_SLASH_COMMAND_PATHS).not.toHaveProperty('pi');
      // Junie support landed after the orbit rename; it never had specorbit-* files
      expect(LEGACY_SLASH_COMMAND_PATHS).not.toHaveProperty('junie');
    });

    it('should use the repo-local compatibility glob pattern for Codex prompt detection', () => {
      const codexPatterns = LEGACY_SLASH_COMMAND_PATHS['codex'];
      expect(codexPatterns.type).toBe('files');
      const patterns = Array.isArray(codexPatterns.pattern) ? codexPatterns.pattern : [codexPatterns.pattern];
      expect(patterns).toContain('.codex/prompts/specorbit-*.md');
      expect(patterns).not.toContain('.codex/prompts/orbit-*.md');
    });
  });

  describe('LEGACY_GLOBAL_SLASH_COMMAND_PATHS', () => {
    it('should define the allowlisted managed global Codex prompt names separately from project-local paths', () => {
      const codexPatterns = LEGACY_GLOBAL_SLASH_COMMAND_PATHS['codex'];
      expect(codexPatterns.managedFileNames).toContain('orbit-explore.md');
      expect(codexPatterns.managedFileNames).toContain('orbit-apply.md');
      expect(codexPatterns.managedFileNames).toContain('orbit-update.md');
      expect(codexPatterns.workflowIdsByFileName?.['orbit-update.md']).toEqual(['update']);
      expect(codexPatterns.managedFileNames).not.toContain('orbit-review.md');
      expect(codexPatterns.managedFileNames).not.toContain('specorbit-proposal.md');
      expect(codexPatterns.resolvePromptDir()).toBe(getCodexPromptDir());
    });
  });

  describe('getToolsFromLegacyArtifacts', () => {
    it('should extract claude from directory-based legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: ['.claude/commands/specorbit'],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('claude');
      expect(tools).toHaveLength(1);
    });

    it('should extract cursor from file-based legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.cursor/commands/specorbit-proposal.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('cursor');
      expect(tools).toHaveLength(1);
    });

    it('should extract cursor from Windows-style legacy artifact paths', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.cursor\\commands\\specorbit-proposal.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('cursor');
      expect(tools).toHaveLength(1);
    });

    it('should extract multiple tools from mixed legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: ['.claude/commands/specorbit', '.qoder/commands/specorbit'],
        slashCommandFiles: ['.cursor/commands/specorbit-apply.md', '.windsurf/workflows/specorbit-archive.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('claude');
      expect(tools).toContain('qoder');
      expect(tools).toContain('cursor');
      expect(tools).toContain('devin');
      expect(tools).toHaveLength(4);
    });

    it('should deduplicate tools when multiple files match same tool', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [
          '.cursor/commands/specorbit-proposal.md',
          '.cursor/commands/specorbit-apply.md',
          '.cursor/commands/specorbit-archive.md',
        ],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('cursor');
      expect(tools).toHaveLength(1);
    });

    it('should extract codex from managed global legacy prompt files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [path.join(getCodexPromptDir(), 'orbit-explore.md')],
        globalSlashCommandDetails: [{
          path: path.join(getCodexPromptDir(), 'orbit-explore.md'),
          toolId: 'codex',
          managedFileName: 'orbit-explore.md',
          workflowIds: ['explore'],
          replacementLabel: 'Codex skills',
        }],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('codex');
      expect(tools).toHaveLength(1);
    });

    it('should return empty array when no legacy artifacts', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: false,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toHaveLength(0);
    });

    it('should handle qwen TOML-based legacy files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.qwen/commands/specorbit-proposal.toml'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('qwen');
      expect(tools).toHaveLength(1);
    });

    it('should handle continue prompt files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.continue/prompts/specorbit-apply.prompt'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('continue');
      expect(tools).toHaveLength(1);
    });

    it('should handle github-copilot prompt files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.github/prompts/specorbit-apply.prompt.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('github-copilot');
      expect(tools).toHaveLength(1);
    });

    it('should handle opencode orbit-* legacy files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.opencode/command/orbit-propose.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('opencode');
      expect(tools).toHaveLength(1);
    });

    it('should handle opencode specorbit-* legacy files', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: ['.opencode/command/specorbit-new.md'],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('opencode');
      expect(tools).toHaveLength(1);
    });

    it('should deduplicate opencode when both orbit-* and specorbit-* files exist', () => {
      const detection = {
        configFiles: [],
        configFilesToUpdate: [],
        slashCommandDirs: [],
        slashCommandFiles: [
          '.opencode/command/orbit-propose.md',
          '.opencode/command/specorbit-new.md',
        ],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: false,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toContain('opencode');
      expect(tools).toHaveLength(1);
    });

    it('should not extract tools from config files only', () => {
      // Config files don't indicate which tools were configured
      // Only slash command dirs/files tell us which tools to upgrade
      const detection = {
        configFiles: ['CLAUDE.md'],
        configFilesToUpdate: ['CLAUDE.md'],
        slashCommandDirs: [],
        slashCommandFiles: [],
        globalSlashCommandFiles: [],
        hasSpecorbitAgents: true,
        hasProjectMd: false,
        hasRootAgentsWithMarkers: false,
        hasLegacyArtifacts: true,
      };

      const tools = getToolsFromLegacyArtifacts(detection);
      expect(tools).toHaveLength(0);
    });
  });

  describe('omitToolLegacyArtifacts', () => {
    const baseDetection = () => ({
      configFiles: [],
      configFilesToUpdate: [],
      slashCommandDirs: ['.claude/commands/specorbit'],
      slashCommandFiles: ['.codex/prompts/specorbit-explore.md', '.cursor/commands/specorbit-apply.md'],
      globalSlashCommandFiles: [],
      hasSpecorbitAgents: false,
      hasProjectMd: false,
      hasRootAgentsWithMarkers: false,
      hasLegacyArtifacts: true,
    });

    it('removes only the named tool\'s repo-local artifacts', () => {
      const result = omitToolLegacyArtifacts(baseDetection(), ['codex']);
      expect(result.slashCommandFiles).toEqual(['.cursor/commands/specorbit-apply.md']);
      // Other tools' files and directories are untouched.
      expect(result.slashCommandDirs).toEqual(['.claude/commands/specorbit']);
      expect(result.hasLegacyArtifacts).toBe(true);
    });

    it('recomputes hasLegacyArtifacts to false when nothing is left', () => {
      const detection = {
        ...baseDetection(),
        slashCommandDirs: [],
        slashCommandFiles: ['.codex/prompts/specorbit-explore.md'],
      };
      const result = omitToolLegacyArtifacts(detection, ['codex']);
      expect(result.slashCommandFiles).toEqual([]);
      expect(result.hasLegacyArtifacts).toBe(false);
    });

    it('returns the detection unchanged when no tools are skipped', () => {
      const detection = baseDetection();
      expect(omitToolLegacyArtifacts(detection, [])).toBe(detection);
    });

    it('omits backslash-delimited paths for the skipped tool (Windows)', () => {
      // Defensive: `legacyToolIdForFile` normalizes separators, so a
      // Windows-style path must map to `codex` and be filtered too.
      const detection = {
        ...baseDetection(),
        slashCommandDirs: [],
        slashCommandFiles: ['.codex\\prompts\\specorbit-explore.md'],
      };
      const result = omitToolLegacyArtifacts(detection, ['codex']);
      expect(result.slashCommandFiles).toEqual([]);
      expect(result.hasLegacyArtifacts).toBe(false);
    });
  });
});
