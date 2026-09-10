## MODIFIED Requirements

### Requirement: Global configuration storage
The system SHALL store global configuration in `~/.config/specorbit/config.json`, including telemetry state with `anonymousId` and `noticeSeen` fields.

#### Scenario: Initial config creation

- **WHEN** no global config file exists
- **AND** the first telemetry event is about to be sent
- **THEN** the system creates `~/.config/specorbit/config.json` with telemetry configuration

#### Scenario: Telemetry config structure

- **WHEN** reading or writing telemetry configuration
- **THEN** the config contains a `telemetry` object with `anonymousId` (string UUID) and `noticeSeen` (boolean) fields

#### Scenario: Config file format

- **WHEN** storing configuration
- **THEN** the system writes valid JSON that can be read and modified by users

#### Scenario: Existing config preservation

- **WHEN** adding telemetry fields to an existing config file
- **THEN** the system preserves all existing configuration fields

### Requirement: Global Config Directory Path

The system SHALL resolve the global configuration directory path following XDG Base Directory Specification with platform-specific fallbacks.

#### Scenario: Unix/macOS with XDG_CONFIG_HOME set

- **WHEN** `$XDG_CONFIG_HOME` environment variable is set to `/custom/config`
- **THEN** `getGlobalConfigDir()` returns `/custom/config/specorbit`

#### Scenario: Unix/macOS without XDG_CONFIG_HOME

- **WHEN** `$XDG_CONFIG_HOME` environment variable is not set
- **AND** the platform is Unix or macOS
- **THEN** `getGlobalConfigDir()` returns `~/.config/specorbit` (expanded to absolute path)

#### Scenario: Windows platform

- **WHEN** the platform is Windows
- **AND** `%APPDATA%` is set to `C:\Users\User\AppData\Roaming`
- **THEN** `getGlobalConfigDir()` returns `C:\Users\User\AppData\Roaming\specorbit`
