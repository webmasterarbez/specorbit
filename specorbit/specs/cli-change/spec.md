# cli-change Specification

## Purpose
Define `specorbit change` command behavior for showing, listing, and validating change proposals and deltas.

## Requirements
### Requirement: Change Command

The system SHALL provide a `change` command with subcommands for displaying, listing, and validating change proposals.

#### Scenario: Show change as JSON

- **WHEN** executing `specorbit change show update-error --json`
- **THEN** parse the markdown change file
- **AND** extract change structure and deltas
- **AND** output valid JSON to stdout

#### Scenario: List all changes

- **WHEN** executing `specorbit change list`
- **THEN** scan the specorbit/changes directory
- **AND** return list of all pending changes
- **AND** support JSON output with `--json` flag

#### Scenario: Show only requirement changes

- **WHEN** executing `specorbit change show update-error --requirements-only`
- **THEN** display only the requirement changes (ADDED/MODIFIED/REMOVED/RENAMED)
- **AND** exclude why and what changes sections

#### Scenario: Validate change structure

- **WHEN** executing `specorbit change validate update-error`
- **THEN** parse the change file
- **AND** validate against Zod schema
- **AND** ensure deltas are well-formed

### Requirement: Legacy Compatibility

The system SHALL retain `specorbit change list` as a deprecated alias for listing active changes and direct users to `specorbit list`.

#### Scenario: Legacy list command

- **WHEN** executing `specorbit change list`
- **THEN** display the current list of active changes on stdout
- **AND** write `Warning: "specorbit change list" is deprecated. Use "specorbit list".` to stderr

#### Scenario: Legacy list with JSON output

- **WHEN** executing `specorbit change list --json`
- **THEN** output the active changes as a JSON array on stdout
- **AND** write the deprecation warning to stderr without corrupting the JSON output

#### Scenario: Unsupported legacy list flag

- **WHEN** executing `specorbit change list --all`
- **THEN** reject the unknown option with a nonzero exit code

#### Scenario: Preferred list command

- **WHEN** executing `specorbit list`
- **THEN** display the current list of active changes without a deprecation warning

### Requirement: Interactive show selection

The change show command SHALL support interactive selection when no change name is provided.

#### Scenario: Interactive change selection for show

- **WHEN** executing `specorbit change show` without arguments
- **THEN** display an interactive list of available changes
- **AND** allow the user to select a change to show
- **AND** display the selected change content
- **AND** maintain all existing show options (--json, --deltas-only)

#### Scenario: Non-interactive fallback keeps current behavior

- **GIVEN** stdin is not a TTY or `--no-interactive` is provided or environment variable `OPEN_SPEC_INTERACTIVE=0`
- **WHEN** executing `specorbit change show` without a change name
- **THEN** do not prompt interactively
- **AND** print the existing hint including available change IDs
- **AND** set `process.exitCode = 1`

### Requirement: Interactive validation selection

The change validate command SHALL support interactive selection when no change name is provided.

#### Scenario: Interactive change selection for validation

- **WHEN** executing `specorbit change validate` without arguments
- **THEN** display an interactive list of available changes
- **AND** allow the user to select a change to validate
- **AND** validate the selected change

#### Scenario: Non-interactive fallback keeps current behavior

- **GIVEN** stdin is not a TTY or `--no-interactive` is provided or environment variable `OPEN_SPEC_INTERACTIVE=0`
- **WHEN** executing `specorbit change validate` without a change name
- **THEN** do not prompt interactively
- **AND** print the existing hint including available change IDs
- **AND** set `process.exitCode = 1`

