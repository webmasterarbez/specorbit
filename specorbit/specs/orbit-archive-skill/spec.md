# Orbit Archive Skill Spec

## Purpose

Define the expected behavior for the `/orbit:archive` skill, including readiness checks, spec sync prompting, archive execution, and user-facing output.

## Requirements

### Requirement: Orbit Archive Skill

The system SHALL provide an `/orbit:archive` skill that archives completed changes in the experimental workflow.

#### Scenario: Archive a change with all artifacts complete

- **WHEN** agent executes `/orbit:archive` with a change name
- **AND** all artifacts in the schema are complete
- **AND** all tasks are complete
- **THEN** the agent moves the change to `specorbit/changes/archive/<target-name>/`
- **AND** displays success message with archived location

#### Scenario: Change selection prompt

- **WHEN** agent executes `/orbit:archive` without specifying a change
- **THEN** the agent infers the change from conversation context, or auto-selects it when only one active change exists
- **AND** when ambiguous, prompts user to select from available changes, showing only active changes (excludes archive/)
- **AND** announces which change was selected and how to override

### Requirement: Artifact Completion Check

The skill SHALL check artifact completion status using the artifact graph before archiving.

#### Scenario: Incomplete artifacts warning

- **WHEN** agent checks artifact status
- **AND** one or more artifacts have status other than `done`
- **THEN** display warning listing incomplete artifacts
- **AND** prompt user for confirmation to continue
- **AND** proceed if user confirms

#### Scenario: All artifacts complete

- **WHEN** agent checks artifact status
- **AND** all artifacts have status `done`
- **THEN** proceed without warning

### Requirement: Task Completion Check

The skill SHALL check task completion status from tasks.md before archiving.

#### Scenario: Incomplete tasks found

- **WHEN** agent reads tasks.md
- **AND** incomplete tasks are found (marked with `- [ ]`)
- **THEN** display warning showing count of incomplete tasks
- **AND** prompt user for confirmation to continue
- **AND** proceed if user confirms

#### Scenario: All tasks complete

- **WHEN** agent reads tasks.md
- **AND** all tasks are complete (marked with `- [x]`)
- **THEN** proceed without task-related warning

#### Scenario: No tasks file

- **WHEN** tasks.md does not exist
- **THEN** proceed without task-related warning

### Requirement: Spec Sync Prompt

The skill SHALL prompt to sync delta specs before archiving if specs exist.

#### Scenario: Delta specs exist

- **WHEN** agent checks for delta specs
- **AND** `specs/` directory exists in the change with spec files
- **THEN** prompt user: "This change has delta specs. Would you like to sync them to main specs before archiving?"
- **AND** if user cancels, stop without archiving
- **AND** if user confirms, execute `/orbit:sync` logic inline and wait for it to complete
- **AND** verify every capability that has a delta spec, not only those the sync reports it touched: ADDED requirements present, MODIFIED requirements carrying the changes named in the delta, REMOVED requirements absent, RENAMED requirements present under the new name and absent under the old one
- **AND** treat a capability whose last requirement the sync removed as verified when its main spec was deleted rather than left empty, and a spec the sync deliberately kept and reported as verified too
- **AND** stop without archiving if the sync fails or any capability does not verify
- **AND** archive only after verification passes, or when the user explicitly chose to archive without syncing or to archive already-synced specs

#### Scenario: No delta specs

- **WHEN** agent checks for delta specs
- **AND** no `specs/` directory or no spec files exist
- **THEN** proceed without sync prompt

### Requirement: Archive Process

The skill SHALL move the change to the archive folder with date prefix.

#### Scenario: Successful archive

- **WHEN** archiving a change
- **THEN** create `archive/` directory if it doesn't exist
- **AND** generate target name as `YYYY-MM-DD-<change-name>` using current date, keeping the name as-is when it already starts with a `YYYY-MM-DD-` prefix
- **AND** move entire change directory to archive location
- **AND** preserve `.specorbit.yaml` file in archived change

#### Scenario: Archive already exists

- **WHEN** target archive directory already exists
- **THEN** fail with error message
- **AND** suggest renaming existing archive or using different date

### Requirement: Skill Output

The skill SHALL provide clear feedback about the archive operation.

#### Scenario: Archive complete with sync

- **WHEN** archive completes after syncing specs
- **THEN** display summary:
  - Specs synced (from `/orbit:sync` output)
  - Change archived to location
  - Schema that was used

#### Scenario: Archive complete without sync

- **WHEN** archive completes without syncing specs
- **THEN** display summary:
  - Note that specs were not synced (if applicable)
  - Change archived to location
  - Schema that was used

#### Scenario: Archive complete with warnings

- **WHEN** archive completes with incomplete artifacts or tasks
- **THEN** include note about what was incomplete
- **AND** suggest reviewing if archive was intentional

### Requirement: Load current archive operation inputs

The `/orbit:archive` skill SHALL request current archive operation inputs after resolving the target change and selected planning root, while preserving its existing archive workflow.

#### Scenario: Archive context and guidance are configured

- **WHEN** the skill has selected a change
- **AND** current config contains project context and `operations.archive.guidance`
- **THEN** the skill calls `specorbit instructions archive --change "<name>" --json` with the selected-root context
- **AND** treats context as a required prompt-level instruction input
- **AND** tells the agent to read it and apply relevant project facts, conventions, and constraints
- **AND** treats operation guidance as optional additive advice
- **AND** tells the agent to read and consider it and follow entries that are applicable and compatible with the built-in archive workflow

#### Scenario: Archive operation inputs are absent

- **WHEN** archive instruction output omits context and operation guidance
- **THEN** the skill continues with its existing archive workflow

#### Scenario: Archive instruction lookup fails

- **WHEN** `specorbit instructions archive --change "<name>" --json` exits non-zero or does not return valid archive-instruction JSON
- **THEN** the skill reports the instruction lookup error
- **AND** stops before inspecting or writing specs or moving the change
- **AND** does not treat the failed lookup as absent context or operation guidance

#### Scenario: Archive context or guidance conflicts with the workflow

- **WHEN** returned context or operation guidance conflicts with a built-in archive step, explicit user choice, resolved path, or command contract
- **THEN** the generated skill keeps required project context and advisory operation guidance separate from built-in steps and CLI-derived values
- **AND** tells the agent to report context conflicts
- **AND** tells the agent to explain why conflicting or inapplicable operation guidance was not followed
- **AND** this change leaves existing CLI checks, resolved paths, and command contracts unchanged
- **AND** the template tells the agent not to infer replacement paths, skipped prompts, or command flags from either field
- **AND** the system does not represent that prompt-level precedence as an enforceable check

#### Scenario: Archive consumes runtime instructions without copying them

- **WHEN** the skill receives context or operation guidance
- **THEN** it does not copy those fields verbatim into specs, change artifacts, or archive summaries unless separately requested by the user

### Requirement: Preserve archive execution behavior

The `/orbit:archive` skill SHALL keep its existing completion checks, task checks, spec-sync decision, confirmation behavior, archive move, and completion summary in this change.

#### Scenario: Runtime inputs are loaded

- **WHEN** archive instructions return configured inputs
- **THEN** no archive execution phase, filesystem operation, or user decision is added, removed, or reordered solely by this change

### Requirement: Carry artifact rules into archive-driven spec sync

The `/orbit:archive` skill SHALL fetch current `specs` artifact instructions before archive-driven spec sync writes main specs and SHALL use the returned artifact rules only to constrain those specs.

#### Scenario: Archive discovers delta specs from the specs artifact

- **WHEN** archive assesses delta specs for a selected change
- **THEN** it uses `artifactPaths.specs.existingOutputPaths` from that change's status output as the complete delta-spec input
- **AND** does not infer delta specs from other artifacts

#### Scenario: Schema or change has no specs outputs

- **WHEN** `artifactPaths.specs` is absent or its `existingOutputPaths` list is empty
- **THEN** archive continues without a spec-sync prompt
- **AND** does not request `specs` artifact instructions

#### Scenario: Archive sync writes main specs

- **WHEN** `artifactPaths.specs.existingOutputPaths` contains delta specs
- **AND** the user chooses to sync them during archive
- **THEN** the skill requests `specorbit instructions specs --change "<name>" --json` once using the selected change and planning root
- **AND** applies the returned artifact rules while semantically merging the delta into the main spec
- **AND** keeps artifact rules separate from archive `operationGuidance`
- **AND** passes the specs-rule snapshot to the inline sync workflow so that workflow does not fetch the same instructions again

#### Scenario: Specs instruction lookup fails

- **WHEN** delta specs exist and the user chooses to sync them during archive
- **AND** `specorbit instructions specs --change "<name>" --json` exits non-zero or does not return valid artifact-instruction JSON
- **THEN** the skill reports the instruction lookup error
- **AND** stops before modifying any main spec or moving the change
- **AND** does not treat the failed lookup as an absent artifact rule set

#### Scenario: User archives without syncing

- **WHEN** delta specs exist and the user explicitly chooses archive without syncing
- **THEN** the skill does not request `specs` artifact instructions for a merge
- **AND** the existing archive-without-sync path continues

#### Scenario: Artifact rules are absent

- **WHEN** archive-driven spec sync receives no rules from `specs` artifact instructions
- **THEN** the existing semantic merge behavior continues unchanged

#### Scenario: Artifact rules contain operation-like advice

- **WHEN** an artifact rule describes archive paths, prompts, command flags, or unrelated workflow steps
- **THEN** the generated skill limits that rule to the content and form of the artifact being written
- **AND** existing archive paths, prompts, CLI checks, and command contracts remain unchanged

#### Scenario: Artifact rule text is consumed

- **WHEN** archive-driven spec sync applies artifact rules
- **THEN** the rules guide the resulting artifact without being copied verbatim into that artifact or the archive summary
