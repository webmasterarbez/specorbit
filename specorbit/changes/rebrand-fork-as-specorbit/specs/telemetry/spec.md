## MODIFIED Requirements

### Requirement: Environment variable opt-out
The system SHALL disable telemetry when `SPECORBIT_TELEMETRY=0` or `DO_NOT_TRACK=1` environment variables are set.

#### Scenario: SPECORBIT_TELEMETRY opt-out
- **WHEN** `SPECORBIT_TELEMETRY=0` is set in the environment
- **THEN** the system sends no telemetry events

#### Scenario: DO_NOT_TRACK opt-out
- **WHEN** `DO_NOT_TRACK=1` is set in the environment
- **THEN** the system sends no telemetry events

#### Scenario: Environment variable takes precedence
- **WHEN** the user has previously used the CLI (config exists)
- **AND** the user sets `SPECORBIT_TELEMETRY=0`
- **THEN** telemetry is disabled regardless of config state

### Requirement: First-run telemetry notice
The system SHALL display a one-line telemetry disclosure notice on the first command execution, before any telemetry is sent.

#### Scenario: First command execution
- **WHEN** a user runs their first specorbit command
- **AND** telemetry is enabled
- **THEN** the system displays: "Note: SpecOrbit collects anonymous usage stats. Opt out: SPECORBIT_TELEMETRY=0"

#### Scenario: Subsequent command execution
- **WHEN** a user has already seen the notice (noticeSeen: true in config)
- **THEN** the system does not display the notice

#### Scenario: Notice before telemetry
- **WHEN** displaying the first-run notice
- **THEN** the notice appears before any telemetry event is sent
