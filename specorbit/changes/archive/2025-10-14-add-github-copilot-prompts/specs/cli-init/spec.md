## MODIFIED Requirements

### Requirement: Slash Command Configuration
The init command SHALL generate slash command files for supported editors using shared templates.

#### Scenario: Generating slash commands for Claude Code
- **WHEN** the user selects Claude Code during initialization
- **THEN** create `.claude/commands/specorbit/proposal.md`, `.claude/commands/specorbit/apply.md`, and `.claude/commands/specorbit/archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SpecOrbit workflow stage

#### Scenario: Generating slash commands for Cursor
- **WHEN** the user selects Cursor during initialization
- **THEN** create `.cursor/commands/specorbit-proposal.md`, `.cursor/commands/specorbit-apply.md`, and `.cursor/commands/specorbit-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SpecOrbit workflow stage

#### Scenario: Generating slash commands for OpenCode
- **WHEN** the user selects OpenCode during initialization
- **THEN** create `.opencode/commands/specorbit-proposal.md`, `.opencode/commands/specorbit-apply.md`, and `.opencode/commands/specorbit-archive.md`
- **AND** populate each file from shared templates so command text matches other tools
- **AND** each template includes instructions for the relevant SpecOrbit workflow stage

#### Scenario: Generating slash commands for Windsurf
- **WHEN** the user selects Windsurf during initialization
- **THEN** create `.windsurf/workflows/specorbit-proposal.md`, `.windsurf/workflows/specorbit-apply.md`, and `.windsurf/workflows/specorbit-archive.md`
- **AND** populate each file from shared templates (wrapped in SpecOrbit markers) so workflow text matches other tools
- **AND** each template includes instructions for the relevant SpecOrbit workflow stage

#### Scenario: Generating slash commands for Kilo Code
- **WHEN** the user selects Kilo Code during initialization
- **THEN** create `.kilocode/workflows/specorbit-proposal.md`, `.kilocode/workflows/specorbit-apply.md`, and `.kilocode/workflows/specorbit-archive.md`
- **AND** populate each file from shared templates (wrapped in SpecOrbit markers) so workflow text matches other tools
- **AND** each template includes instructions for the relevant SpecOrbit workflow stage

#### Scenario: Generating slash commands for Codex
- **WHEN** the user selects Codex during initialization
- **THEN** create global prompt files at `~/.codex/prompts/specorbit-proposal.md`, `~/.codex/prompts/specorbit-apply.md`, and `~/.codex/prompts/specorbit-archive.md` (or under `$CODEX_HOME/prompts` if set)
- **AND** populate each file from shared templates that map the first numbered placeholder (`$1`) to the primary user input (e.g., change identifier or question text)
- **AND** wrap the generated content in SpecOrbit markers so `specorbit update` can refresh the prompts without touching surrounding custom notes

#### Scenario: Generating slash commands for GitHub Copilot
- **WHEN** the user selects GitHub Copilot during initialization
- **THEN** create `.github/prompts/specorbit-proposal.prompt.md`, `.github/prompts/specorbit-apply.prompt.md`, and `.github/prompts/specorbit-archive.prompt.md`
- **AND** populate each file with YAML frontmatter containing a `description` field that summarizes the workflow stage
- **AND** include `$ARGUMENTS` placeholder to capture user input
- **AND** wrap the shared template body with SpecOrbit markers so `specorbit update` can refresh the content
- **AND** each template includes instructions for the relevant SpecOrbit workflow stage
