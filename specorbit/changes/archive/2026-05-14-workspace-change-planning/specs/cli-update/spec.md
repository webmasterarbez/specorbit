## ADDED Requirements

### Requirement: Repo update redirects from workspace planning homes
The repo-local `specorbit update` command SHALL not silently treat a workspace planning home as a repo-local SpecOrbit project.

#### Scenario: Running update from a workspace root
- **GIVEN** the command runs from a SpecOrbit workspace root
- **WHEN** the user runs `specorbit update`
- **THEN** SpecOrbit SHALL not generate repo-local project files in the workspace root
- **AND** it SHALL tell the user to run `specorbit workspace update`

#### Scenario: Running update from inside a workspace planning directory
- **GIVEN** the command runs from a subdirectory of a SpecOrbit workspace planning home
- **WHEN** the user runs `specorbit update`
- **THEN** SpecOrbit SHALL not run repo-local update behavior
- **AND** it SHALL tell the user to run `specorbit workspace update`

#### Scenario: Running update from a repo-local project
- **GIVEN** the command runs from inside a repo-local SpecOrbit project
- **WHEN** the user runs `specorbit update`
- **THEN** SpecOrbit SHALL preserve existing repo-local update behavior
