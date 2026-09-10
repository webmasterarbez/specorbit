# Context Store As Standalone SpecOrbit Root Spec

## Outcome

`context-store setup` and `context-store register` treat a context store as a
normal standalone SpecOrbit root with a thin identity file.

After setup or registration, the durable planning state lives in normal
SpecOrbit artifacts: config, specs, changes, and archived changes. The
`.specorbit-store/` directory remains identity or local registry metadata, not a
separate planning model.

The existing beta context-store, initiative, and workspace shapes are not a
compatibility contract. This slice ignores old beta files unless they are the
thin `.specorbit-store/store.yaml` identity file used by the new model.

## User Experience

A human or agent can create or register a standalone SpecOrbit repo and then see
the same root shape they would expect from a normal SpecOrbit project:

```text
context-store-root/
  .specorbit-store/
    store.yaml
  specorbit/
    config.yaml
    specs/
    changes/
      archive/
```

The command output and help point users toward normal SpecOrbit specs and
changes, not initiatives, workspace-owned planning, generated agent files, or
collection-specific state.

In plain terms:

```text
context store = normal SpecOrbit root + .specorbit-store/store.yaml
```

## Scope

In scope:

- Root shape parity for `context-store setup` and `context-store register`.
- Default config creation during setup.
- Safe handling of missing, empty, Git-only, and existing healthy SpecOrbit-root
  directories.
- Registering cloned or existing context stores on the local machine.
- Turning a healthy standalone SpecOrbit root into a context store only after
  clear user confirmation.
- Separate `context-store doctor` reporting for SpecOrbit-root health.
- Tests that verify setup, register, doctor, idempotency for the new model, and
  unsafe-folder behavior.

Out of scope:

- Store selectors for core lifecycle commands.
- Creating initiative links or initiative collections.
- Workspace-owned planning behavior.
- Agent/tool installation, generated commands, migration, or onboarding flows.
- Clone, pull, push, sync, branch, worktree, dashboard, apply, verify, or archive
  orchestration.
- Migrating, preserving, or cleaning up old beta context-store, initiative, or
  workspace file shapes.
- Public terminology cleanup or broad documentation rewrites.

## Acceptance Criteria

### Setup Ensures A Normal Root

`context-store setup` creates or preserves a healthy SpecOrbit root. A healthy
SpecOrbit root contains `specorbit/`, a config file
(`specorbit/config.yaml` or `specorbit/config.yml`), `specorbit/specs/`,
`specorbit/changes/`, and `specorbit/changes/archive/`.

When setup creates a config file, it creates `specorbit/config.yaml` with the
default `spec-driven` schema.

#### Scenario: Setting Up A Missing Or Empty Store

- **GIVEN** a missing directory or empty directory
- **WHEN** the user runs `context-store setup`
- **THEN** SpecOrbit leaves the directory with `.specorbit-store/store.yaml`
- **AND** `specorbit/config.yaml` exists with the default `spec-driven` schema
- **AND** `specorbit/specs/`, `specorbit/changes/`, and
  `specorbit/changes/archive/` exist
- **AND** JSON output reports the relative paths created by the operation in
  `created_files`

#### Scenario: Accepting A Git-Only Directory

- **GIVEN** an existing directory that contains only `.git/`
- **WHEN** the user runs `context-store setup`
- **THEN** SpecOrbit treats the directory as a safe fresh store
- **AND** SpecOrbit preserves `.git/`
- **AND** SpecOrbit creates the context-store identity metadata and healthy
  SpecOrbit root

#### Scenario: Preserving An Existing Healthy Root

- **GIVEN** an initialized standalone SpecOrbit root
- **WHEN** the user runs `context-store setup`
- **THEN** SpecOrbit preserves existing config, specs, changes, and archived
  changes
- **AND** SpecOrbit creates `.specorbit-store/store.yaml` when identity metadata
  is missing

#### Scenario: Creating Default Config Non-Interactively

- **GIVEN** setup runs in non-interactive or JSON mode without tool selection
- **AND** no `specorbit/config.yaml` or `specorbit/config.yml` exists
- **WHEN** setup completes successfully
- **THEN** `specorbit/config.yaml` exists with the default `spec-driven` schema

#### Scenario: Preserving Existing Config

- **GIVEN** `specorbit/config.yaml` or `specorbit/config.yml` already exists
- **WHEN** setup completes successfully
- **THEN** SpecOrbit preserves the existing config file

#### Scenario: Rejecting Unsafe Folders

- **GIVEN** an arbitrary non-empty unmarked folder
- **WHEN** the user runs `context-store setup`
- **THEN** SpecOrbit rejects it without treating it as a store root
- **AND** it does not create context-store metadata or SpecOrbit-root files in
  that folder

#### Scenario: Rejecting Nested Git Setup Paths

- **GIVEN** a setup target path inside another Git repository
- **WHEN** the user runs `context-store setup`
- **THEN** SpecOrbit rejects the path as unsafe for this slice
- **AND** it does not create context-store metadata or SpecOrbit-root files in
  that path

### Register Requires An Existing Root

`context-store register` remembers a local clone or existing local root on this
machine. It does not initialize planning files.

#### Scenario: Registering A Cloned Context Store

- **GIVEN** an existing healthy SpecOrbit root with `.specorbit-store/store.yaml`
- **WHEN** the user runs `context-store register`
- **THEN** SpecOrbit registers it
- **AND** SpecOrbit writes local registry state only when needed
- **AND** SpecOrbit does not create or rewrite SpecOrbit planning files

#### Scenario: Turning A Healthy Root Into A Context Store

- **GIVEN** an existing healthy SpecOrbit root without `.specorbit-store/store.yaml`
- **WHEN** the user runs `context-store register`
- **THEN** SpecOrbit asks whether to turn the root into the named context store
- **AND** if the user confirms, SpecOrbit creates `.specorbit-store/store.yaml`
  and registers the store locally
- **AND** if the user declines, SpecOrbit does not write metadata or registry
  state

#### Scenario: Refusing Unconfirmed Non-Interactive Conversion

- **GIVEN** an existing healthy SpecOrbit root without `.specorbit-store/store.yaml`
- **WHEN** the user runs `context-store register` in non-interactive or JSON mode
  without explicit confirmation
- **THEN** SpecOrbit refuses to convert the root into a context store
- **AND** SpecOrbit does not write metadata or registry state

#### Scenario: Refusing Arbitrary Directories

- **GIVEN** a missing directory, partial SpecOrbit root, or existing directory
  that is not a healthy SpecOrbit root
- **WHEN** the user runs `context-store register`
- **THEN** SpecOrbit refuses to register it
- **AND** SpecOrbit does not silently initialize it as a SpecOrbit root
- **AND** SpecOrbit does not create `.specorbit-store/store.yaml` or local
  registry state

### Metadata Stays Thin

Context-store metadata remains identity or registry metadata only.

#### Scenario: Avoiding Old Planning Models In This Slice

- **WHEN** setup or register completes
- **THEN** SpecOrbit does not create initiative links, initiative collections, or
  workspace-owned planning state
- **AND** SpecOrbit does not install generated agent skills, slash commands, or
  tool configuration files into the store
- **AND** SpecOrbit does not run full `specorbit init`, tool detection, legacy
  cleanup, migration, skill generation, command generation, or onboarding flows

#### Scenario: Ignoring Old Beta Files

- **GIVEN** a directory contains old beta files such as `initiatives/`,
  `.specorbit-workspace/`, `workspace.yaml`, `AGENTS.md`, `.codex/`, `.claude/`,
  or `.cursor/`
- **WHEN** setup or register succeeds for the new model
- **THEN** SpecOrbit ignores those files for this slice
- **AND** SpecOrbit does not migrate, upgrade, delete, or repair those files
- **AND** SpecOrbit does not treat those files as proof that the folder is a
  healthy SpecOrbit root or valid context store
- **AND** SpecOrbit does not preserve old beta planning behavior as a requirement

#### Scenario: Validating Thin Identity Metadata

- **GIVEN** `.specorbit-store/store.yaml` exists
- **WHEN** setup, register, or doctor reads it
- **THEN** SpecOrbit treats it as the context-store identity file
- **AND** the file must match the thin identity shape for the new model
- **AND** invalid or mismatched identity metadata is reported as a metadata issue

### Doctor Separates Root Health

`context-store doctor` reports SpecOrbit-root health separately from
context-store metadata and Git health. In JSON output, each store includes a
distinct `specorbit_root` section.

#### Scenario: Reporting SpecOrbit Root Health

- **WHEN** doctor inspects a context store
- **THEN** the report covers the `specorbit/` directory,
  `specorbit/config.yaml` or `specorbit/config.yml`, `specorbit/specs/`,
  `specorbit/changes/`, and `specorbit/changes/archive/`
- **AND** root-health issues are distinguishable from metadata and Git issues in
  human and JSON output
- **AND** JSON output includes `specorbit_root` separately from `metadata` and
  `git`
- **AND** doctor does not mutate files

#### Scenario: Reporting Without Repairing

- **GIVEN** a registered context store has valid metadata and Git state but is
  missing `specorbit/changes/archive/`
- **WHEN** doctor inspects the context store
- **THEN** doctor reports the missing archive directory under `specorbit_root`
- **AND** doctor does not create `specorbit/changes/archive/`

### Safety, Not Beta Compatibility

This slice protects user-authored files and repeatable command behavior. It does
not treat previous beta context-store behavior as a stable surface.

#### Scenario: Repeating Setup Or Register

- **GIVEN** the same context-store id and path are already registered and the
  SpecOrbit root is healthy
- **WHEN** setup or register runs again for that root
- **THEN** SpecOrbit reports that the store is already registered, already exists,
  or has nothing to change
- **AND** SpecOrbit does not mutate files just to prove the command worked
- **AND** JSON output reports no newly created files for the no-op operation
- **AND** SpecOrbit does not duplicate registry entries

#### Scenario: Preserving User Edits Across Reruns

- **GIVEN** the user edits `specorbit/config.yaml` or `specorbit/config.yml` after
  setup
- **WHEN** setup or register runs again for that root
- **THEN** SpecOrbit preserves the edited config file
- **AND** SpecOrbit preserves user-authored specs, changes, archived changes, and
  valid identity metadata

#### Scenario: Preserving User Content On Failure

- **GIVEN** setup or register creates files or directories during an operation
- **WHEN** the operation fails before completion
- **THEN** SpecOrbit removes only files and empty directories it created during
  that operation
- **AND** SpecOrbit preserves unrelated user content
