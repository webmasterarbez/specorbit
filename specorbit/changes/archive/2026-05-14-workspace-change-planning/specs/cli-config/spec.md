## ADDED Requirements

### Requirement: Config profile applies to current workspace
The `specorbit config profile` command SHALL remain global while offering an explicit workspace apply path when run from inside a SpecOrbit workspace.

#### Scenario: Config profile run inside a workspace
- **GIVEN** the command runs from inside a SpecOrbit workspace
- **WHEN** the user changes profile or delivery settings with interactive `specorbit config profile`
- **THEN** SpecOrbit SHALL save the global config changes
- **AND** it SHALL prompt: `Apply changes to this workspace now?`

#### Scenario: User confirms workspace apply
- **GIVEN** `specorbit config profile` changed global profile or delivery settings inside a workspace
- **WHEN** the user confirms the workspace apply prompt
- **THEN** SpecOrbit SHALL run `specorbit workspace update` for the current workspace
- **AND** it SHALL not run repo-local `specorbit update` unless the current planning home is repo-local

#### Scenario: User declines workspace apply
- **GIVEN** `specorbit config profile` changed global profile or delivery settings inside a workspace
- **WHEN** the user declines the workspace apply prompt
- **THEN** SpecOrbit SHALL explain that global config was updated
- **AND** it SHALL tell the user to run `specorbit workspace update` later to apply the profile to workspace-local skills
- **AND** it SHALL not modify workspace skill files

#### Scenario: No-op inside workspace
- **GIVEN** the command runs from inside a SpecOrbit workspace
- **WHEN** `specorbit config profile` exits with no effective config changes
- **THEN** SpecOrbit SHALL not prompt to apply changes
- **AND** it SHALL warn if workspace-local skills are out of sync with the current global profile
- **AND** the warning SHALL suggest `specorbit workspace update`

#### Scenario: Core preset shortcut inside a workspace
- **GIVEN** the command runs from inside a SpecOrbit workspace
- **WHEN** the user runs `specorbit config profile core`
- **THEN** SpecOrbit SHALL save the global config change without prompting to apply immediately
- **AND** it SHALL tell the user to run `specorbit workspace update` to apply the profile to workspace-local skills

#### Scenario: Core preset shortcut inside a repo project
- **GIVEN** the command runs from inside a repo-local SpecOrbit project
- **WHEN** the user runs `specorbit config profile core`
- **THEN** SpecOrbit SHALL preserve existing repo-local shortcut behavior
- **AND** it SHALL tell the user to run `specorbit update` to apply the profile to project files

#### Scenario: Workspace planning home wins over linked repo project
- **GIVEN** the command runs in a path under a workspace planning home where a repo-local SpecOrbit project could also be detected
- **WHEN** SpecOrbit decides which apply prompt to show
- **THEN** the nearest current planning home SHALL determine whether to offer `specorbit workspace update` or repo-local `specorbit update`
- **AND** SpecOrbit SHALL not apply profile changes to a linked repo when the current planning home is the workspace

#### Scenario: Linked repo keeps repo-local profile behavior
- **GIVEN** a repo-local SpecOrbit project is registered as a workspace link
- **AND** the command runs from inside that linked repo rather than from the workspace planning home
- **WHEN** SpecOrbit decides which apply prompt or guidance to show
- **THEN** SpecOrbit SHALL preserve repo-local `specorbit update` behavior for that repo
- **AND** it SHALL not offer `specorbit workspace update` unless the workspace is explicitly selected
