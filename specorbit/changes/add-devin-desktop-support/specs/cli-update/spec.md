# cli-update Delta Specification

## MODIFIED Requirements

### Requirement: Slash Command Updates

The update command SHALL refresh existing slash command files for configured tools without creating new ones, and ensure the OpenCode archive command accepts change ID arguments.

#### Scenario: Updating slash commands for Antigravity
- **WHEN** `.agent/workflows/` contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh the SpecOrbit-managed portion of each file so the workflow copy matches other tools while preserving the existing single-field `description` frontmatter
- **AND** skip creating any missing workflow files during update, mirroring the behavior for Devin Desktop and other IDEs

#### Scenario: Updating slash commands for Claude Code
- **WHEN** `.claude/commands/specorbit/` contains `proposal.md`, `apply.md`, and `archive.md`
- **THEN** refresh each file using shared templates
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Updating slash commands for CodeBuddy Code
- **WHEN** `.codebuddy/commands/specorbit/` contains `proposal.md`, `apply.md`, and `archive.md`
- **THEN** refresh each file using the shared CodeBuddy templates that include YAML frontmatter for the `description` and `argument-hint` fields
- **AND** use square bracket format for `argument-hint` parameters (e.g., `[change-id]`)
- **AND** preserve any user customizations outside the SpecOrbit managed markers

#### Scenario: Updating slash commands for Cline
- **WHEN** `.clinerules/workflows/` contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh each file using shared templates
- **AND** include Cline-specific Markdown heading frontmatter
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Updating slash commands for Continue
- **WHEN** `.continue/prompts/` contains `specorbit-proposal.prompt`, `specorbit-apply.prompt`, and `specorbit-archive.prompt`
- **THEN** refresh each file using shared templates
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Updating slash commands for Crush
- **WHEN** `.crush/commands/` contains `specorbit/proposal.md`, `specorbit/apply.md`, and `specorbit/archive.md`
- **THEN** refresh each file using shared templates
- **AND** include Crush-specific frontmatter with SpecOrbit category and tags
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Updating slash commands for Cursor
- **WHEN** `.cursor/commands/` contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh each file using shared templates
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Updating slash commands for Factory Droid
- **WHEN** `.factory/commands/` contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh each file using the shared Factory templates that include YAML frontmatter for the `description` and `argument-hint` fields
- **AND** ensure the template body retains the `$ARGUMENTS` placeholder so user input keeps flowing into droid
- **AND** update only the content inside the SpecOrbit managed markers, leaving any unmanaged notes untouched
- **AND** skip creating missing files during update

#### Scenario: Updating slash commands for OpenCode
- **WHEN** `.opencode/commands/` contains SpecOrbit-managed `orbit-*.md` command files for the configured profile (for example `orbit-propose.md`, `orbit-apply.md`, and `orbit-archive.md`)
- **THEN** refresh each file using shared templates
- **AND** transform command references to hyphen form (for example `/orbit-propose`), as for every tool whose command files are named `orbit-<id>`
- **AND** ensure templates include instructions for the relevant workflow stage
- **AND** ensure the archive command includes `$ARGUMENTS` placeholder in frontmatter for accepting change ID arguments

#### Scenario: Legacy OpenCode command path cleanup
- **WHEN** a project still has command files under the legacy singular path `.opencode/command/` (for example `orbit-*.md` or `specorbit-*.md`)
- **THEN** `specorbit init` or legacy cleanup SHALL remove those files and generate replacements under `.opencode/commands/`
- **AND** `specorbit update` SHALL NOT refresh files that remain only under `.opencode/command/`

#### Scenario: Updating slash commands for Windsurf
- **WHEN** the legacy Windsurf location `.windsurf/workflows/`, now Devin's, contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh each file using shared templates wrapped in SpecOrbit markers
- **AND** ensure templates include instructions for the relevant workflow stage
- **AND** skip creating missing files (the update command only refreshes what already exists)

#### Scenario: Updating workflows for Devin Desktop
- **WHEN** Devin Desktop is a configured tool (its `.devin/` directory exists)
- **THEN** write `.devin/workflows/orbit-<id>.md` for each workflow in the active profile, from shared templates
- **AND** emit frontmatter with `name`, `description`, `category`, and `tags`
- **AND** transform command references to hyphen form (for example `/orbit-propose`), the name Devin registers for a workflow file
- **AND** refresh `.devin/skills/specorbit-*/SKILL.md` with `/specorbit-*` skill references, the one invocation both Devin agents accept

#### Scenario: Updating slash commands for Kilo Code
- **WHEN** `.kilocode/workflows/` contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh each file using shared templates wrapped in SpecOrbit markers
- **AND** ensure templates include instructions for the relevant workflow stage
- **AND** skip creating missing files (the update command only refreshes what already exists)

#### Scenario: Updating slash commands for Codex
- **GIVEN** the global Codex prompt directory contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **WHEN** a user runs `specorbit update`
- **THEN** refresh each file using the shared slash-command templates (including placeholder guidance)
- **AND** preserve any unmanaged content outside the SpecOrbit marker block
- **AND** skip creation when a Codex prompt file is missing

#### Scenario: Updating slash commands for GitHub Copilot
- **WHEN** `.github/prompts/` contains `specorbit-proposal.prompt.md`, `specorbit-apply.prompt.md`, and `specorbit-archive.prompt.md`
- **THEN** refresh each file using shared templates while preserving the YAML frontmatter
- **AND** update only the SpecOrbit-managed block between markers
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Updating slash commands for Gemini CLI
- **WHEN** `.gemini/commands/specorbit/` contains `proposal.toml`, `apply.toml`, and `archive.toml`
- **THEN** refresh the body of each file using the shared proposal/apply/archive templates
- **AND** replace only the content between `<!-- SPECORBIT:START -->` and `<!-- SPECORBIT:END -->` markers inside the `prompt = """` block so the TOML framing (`description`, `prompt`) stays intact
- **AND** skip creating any missing `.toml` files during update; only pre-existing Gemini commands are refreshed

#### Scenario: Updating slash commands for iFlow CLI
- **WHEN** `.iflow/commands/` contains `specorbit-proposal.md`, `specorbit-apply.md`, and `specorbit-archive.md`
- **THEN** refresh each file using shared templates
- **AND** preserve the YAML frontmatter with `name`, `id`, `category`, and `description` fields
- **AND** update only the SpecOrbit-managed block between markers
- **AND** ensure templates include instructions for the relevant workflow stage

#### Scenario: Missing slash command file
- **WHEN** a tool lacks a slash command file
- **THEN** do not create a new file during update
