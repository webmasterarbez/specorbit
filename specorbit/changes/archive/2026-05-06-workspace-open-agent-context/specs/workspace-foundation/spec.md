## ADDED Requirements

### Requirement: Workspace Preferred Opener State
SpecOrbit SHALL store a workspace's preferred opener in machine-local workspace state when the user explicitly chooses one.

#### Scenario: Recording an interactive setup opener choice
- **WHEN** an interactive user chooses a preferred opener during `specorbit workspace setup`
- **THEN** SpecOrbit SHALL record the opener in `.specorbit-workspace/local.yaml`
- **AND** the stored value SHALL use a structured `preferred_opener` object with `kind` and `id`

#### Scenario: Recording a non-interactive setup opener choice
- **WHEN** a non-interactive user runs `specorbit workspace setup --no-interactive --opener codex`
- **THEN** SpecOrbit SHALL record `preferred_opener.kind` as `agent`
- **AND** it SHALL record `preferred_opener.id` as `codex`

#### Scenario: Leaving opener unset during non-interactive setup
- **WHEN** a non-interactive user runs `specorbit workspace setup --no-interactive` with opener selection omitted
- **THEN** SpecOrbit SHALL leave the workspace preferred opener unset
- **AND** the unset state SHALL allow `workspace open` to prompt later

#### Scenario: Supported preferred opener values
- **WHEN** SpecOrbit accepts a preferred opener value
- **THEN** it SHALL accept `codex`, `claude`, `github-copilot`, and `editor`
- **AND** it SHALL map `editor` to `kind: editor` and `id: vscode`
- **AND** it SHALL map agent values to `kind: agent` and the matching agent `id`

#### Scenario: Ordering setup opener choices
- **WHEN** interactive setup displays opener choices
- **THEN** SpecOrbit SHALL show all supported openers
- **AND** it SHALL order openers with detected executables before unavailable openers
- **AND** unavailable openers SHALL remain visible with an availability note

### Requirement: Maintained Workspace Open Surface
SpecOrbit SHALL maintain files that make a workspace directly openable after setup and link changes.

#### Scenario: Creating the open surface during setup
- **WHEN** `specorbit workspace setup` creates a workspace
- **THEN** SpecOrbit SHALL create or refresh `AGENTS.md`
- **AND** it SHALL create or refresh `<workspace-name>.code-workspace`
- **AND** it SHALL create or refresh workspace ignore rules for machine-local open files

#### Scenario: Refreshing the open surface after linking
- **WHEN** `specorbit workspace link` succeeds
- **THEN** SpecOrbit SHALL refresh `AGENTS.md`
- **AND** it SHALL refresh `<workspace-name>.code-workspace`
- **AND** it SHALL refresh workspace ignore rules for machine-local open files

#### Scenario: Refreshing the open surface after relinking
- **WHEN** `specorbit workspace relink` succeeds
- **THEN** SpecOrbit SHALL refresh `AGENTS.md`
- **AND** it SHALL refresh `<workspace-name>.code-workspace`
- **AND** it SHALL refresh workspace ignore rules for machine-local open files

#### Scenario: Building the VS Code workspace file
- **WHEN** SpecOrbit refreshes `<workspace-name>.code-workspace`
- **THEN** the file SHALL include the workspace root
- **AND** the workspace root folder entry SHALL use the root path without a synthetic display name
- **AND** it SHALL include every linked repo or folder with a valid local path
- **AND** it SHALL omit linked repos or folders whose local paths are missing or invalid

#### Scenario: Ignoring the maintained VS Code workspace file
- **WHEN** SpecOrbit refreshes workspace ignore rules
- **THEN** it SHALL ignore the specific maintained `<workspace-name>.code-workspace` file
- **AND** user-authored `*.code-workspace` files SHALL remain eligible for tracking

#### Scenario: Preserving user-authored AGENTS content
- **GIVEN** `AGENTS.md` contains content outside the SpecOrbit workspace guidance markers
- **WHEN** SpecOrbit refreshes workspace guidance
- **THEN** it SHALL replace only the marked SpecOrbit workspace guidance block
- **AND** it SHALL preserve content outside the markers

#### Scenario: Appending AGENTS guidance when markers are missing
- **GIVEN** `AGENTS.md` exists and SpecOrbit workspace guidance markers are absent
- **WHEN** SpecOrbit refreshes workspace guidance
- **THEN** it SHALL append the marked SpecOrbit workspace guidance block
- **AND** it SHALL preserve the existing file content
