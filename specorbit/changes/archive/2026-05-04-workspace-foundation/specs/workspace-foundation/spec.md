## ADDED Requirements

### Requirement: Recognizable Workspace Home
SpecOrbit SHALL give users and agents a recognizable workspace home for cross-repo planning.

#### Scenario: Planning across linked repos or folders
- **WHEN** a user creates a SpecOrbit workspace for repos or folders they plan across
- **THEN** the workspace SHALL provide a durable planning home
- **AND** the workspace SHALL be able to hold multiple changes over time

#### Scenario: Working from inside a workspace
- **GIVEN** a user runs SpecOrbit from a workspace root or one of its subdirectories
- **WHEN** SpecOrbit resolves the current workspace
- **THEN** it SHALL identify the workspace root
- **AND** it SHALL use the workspace root's `changes/` directory as the workspace planning area

#### Scenario: Avoiding accidental workspace mode
- **GIVEN** a directory has `changes/` but is not a SpecOrbit workspace
- **WHEN** SpecOrbit resolves the current workspace
- **THEN** it SHALL avoid treating that directory as a workspace
- **AND** it SHALL enter workspace mode only when the workspace identity file is present

### Requirement: Stable Workspace Name
SpecOrbit SHALL use one folder-style workspace name across workspace identity, managed storage, and the local registry.

#### Scenario: Using one workspace name
- **WHEN** SpecOrbit creates or registers a managed workspace
- **THEN** the workspace name SHALL be stored in `.specorbit-workspace/workspace.yaml`
- **AND** the same name SHALL be used as the default managed workspace folder name
- **AND** the same name SHALL be used as the local registry name

#### Scenario: Rejecting invalid folder-style names
- **WHEN** SpecOrbit accepts a workspace name
- **THEN** it SHALL reject empty names, `.` or `..`, and names containing path separators
- **AND** setup or create flows SHALL report OS-level folder creation failures clearly

### Requirement: Dedicated Workspace Identity
SpecOrbit SHALL distinguish a coordination workspace from a repo-local SpecOrbit project.

#### Scenario: Reading workspace identity
- **WHEN** SpecOrbit reads or writes workspace identity and workspace state
- **THEN** it SHALL use `.specorbit-workspace/`

#### Scenario: Preserving repo-local SpecOrbit projects
- **GIVEN** a repo-local SpecOrbit project uses `specorbit/`
- **WHEN** that repo is linked to a workspace
- **THEN** SpecOrbit SHALL continue treating `specorbit/` as that repo's local SpecOrbit directory
- **AND** workspace planning SHALL remain anchored in the workspace root

#### Scenario: Avoiding repo-local initialization in the workspace root
- **WHEN** a user is working from a SpecOrbit workspace root
- **THEN** SpecOrbit SHALL treat that root as a workspace coordination surface
- **AND** users SHALL not need to initialize a repo-local `specorbit/` project inside the workspace root

### Requirement: Safe Workspace Sharing
SpecOrbit SHALL keep shared workspace information separate from local machine paths.

#### Scenario: Sharing workspace planning
- **WHEN** a workspace is shared with another user or machine
- **THEN** shared workspace information SHALL include portable workspace identity and stable link names
- **AND** it SHALL not require another user to reuse the original user's absolute checkout paths

#### Scenario: Keeping checkout paths local
- **WHEN** SpecOrbit stores local paths for a workspace
- **THEN** those paths SHALL be treated as local to the current machine and runtime
- **AND** another machine MAY map the same link names to different local paths

#### Scenario: Preserving runtime-local paths
- **WHEN** SpecOrbit reads or writes local workspace paths
- **THEN** it SHALL preserve path strings valid for the current runtime
- **AND** it SHALL support native Windows paths and WSL2/Linux paths as local state values

#### Scenario: Excluding local state from portable collaboration
- **WHEN** SpecOrbit creates a workspace
- **THEN** it SHALL exclude `.specorbit-workspace/local.yaml` from portable collaboration state by default
- **AND** `.specorbit-workspace/workspace.yaml` SHALL remain the portable workspace identity and link-name state

### Requirement: Standard Workspace Location
SpecOrbit SHALL use a standard location for SpecOrbit-managed workspaces without asking most users to choose one.

#### Scenario: Using the standard workspace location
- **WHEN** SpecOrbit needs the location for SpecOrbit-managed workspaces
- **THEN** it SHALL use `<global-data-dir>/workspaces`
- **AND** `<global-data-dir>` SHALL follow existing SpecOrbit XDG and platform data directory behavior

#### Scenario: Avoiding workspace-specific storage overrides
- **WHEN** SpecOrbit resolves the location for SpecOrbit-managed workspaces
- **THEN** it SHALL not use a workspace-specific environment variable, command, or configuration setting in this slice
- **AND** managed workspace storage SHALL remain under `<global-data-dir>/workspaces`

#### Scenario: Running from native Windows
- **WHEN** SpecOrbit runs from native Windows shells such as PowerShell
- **AND** `XDG_DATA_HOME` is not set
- **THEN** SpecOrbit SHALL store managed workspaces under the Windows global data location
- **AND** paths SHALL follow native Windows path behavior

#### Scenario: Running from WSL2
- **WHEN** SpecOrbit runs from WSL2
- **THEN** SpecOrbit SHALL store managed workspaces under the Linux/XDG data location inside WSL
- **AND** paths SHALL follow Linux path behavior inside WSL

#### Scenario: Using the workspace location automatically
- **WHEN** SpecOrbit creates or resolves SpecOrbit-managed workspaces in later workflows
- **THEN** it SHALL use the resolved workspace location by default
- **AND** users SHALL be able to follow the normal workspace flow without choosing a storage location

#### Scenario: Showing the workspace path
- **WHEN** SpecOrbit creates a workspace in the standard workspace location
- **THEN** it SHALL report the workspace path to the user
- **AND** it SHALL not hide where planning files were created

#### Scenario: Staying in the current runtime
- **WHEN** SpecOrbit resolves workspace paths or local repo paths
- **THEN** it SHALL interpret paths for the runtime running SpecOrbit
- **AND** Windows, UNC WSL, and WSL mount paths SHALL remain explicit user-provided paths

### Requirement: Local Workspace Registry
SpecOrbit SHALL keep a lightweight local registry of known workspaces on the current machine.

#### Scenario: Recording known workspaces
- **WHEN** SpecOrbit creates or learns about a managed workspace
- **THEN** it SHALL be able to record the workspace name and path in a local registry
- **AND** the registry SHALL be machine-local state

#### Scenario: Keeping workspace folders authoritative
- **WHEN** SpecOrbit reads workspace details
- **THEN** each workspace folder's `.specorbit-workspace/workspace.yaml` SHALL remain the source of truth for that workspace
- **AND** the local registry SHALL act only as an index of known workspace paths

#### Scenario: Finding workspaces from anywhere
- **WHEN** a later workspace command runs outside a workspace directory
- **THEN** SpecOrbit MAY use the local registry to find known workspaces
- **AND** commands that need one workspace MAY use the registry to support an interactive picker

### Requirement: Stable Link Names
SpecOrbit SHALL use stable link names to refer to repos and folders in workspace planning.

#### Scenario: Referring to a repo or folder in workspace planning
- **WHEN** workspace state or later workspace planning artifacts refer to a linked repo or folder
- **THEN** they SHALL use the stable link name
- **AND** the same link name SHALL remain valid even when local checkout paths differ

#### Scenario: Reusing link names across machines
- **WHEN** a workspace is used on another machine
- **THEN** link names SHALL remain stable
- **AND** local checkout paths MAY differ on that machine

#### Scenario: Rejecting invalid link names
- **WHEN** SpecOrbit accepts a workspace link name
- **THEN** it SHALL reject empty names, `.` or `..`, and names containing path separators
- **AND** link names SHALL be unique within the workspace

### Requirement: Linked Repos And Folders
SpecOrbit SHALL allow workspace planning to include linked repos and folders before they have repo-local SpecOrbit state.

#### Scenario: Planning with a repo that has not adopted SpecOrbit
- **WHEN** a workspace links a repo path that does not yet contain repo-local `specorbit/`
- **THEN** the repo SHALL still be available for workspace-level planning
- **AND** implementation readiness MAY be handled by a later workflow

#### Scenario: Planning across monorepo folders
- **WHEN** planning spans multiple packages, services, apps, or directories inside one monorepo
- **THEN** the workspace SHALL be able to link those folders separately
- **AND** each folder SHALL not need its own repo-local `specorbit/` directory to participate in workspace planning

#### Scenario: Treating repos and folders consistently
- **WHEN** a workspace plan includes both separate repos and folders inside a monorepo
- **THEN** SpecOrbit SHALL use the same planning model for both
- **AND** users SHALL not need to create different kinds of workspace plans for multi-repo and monorepo changes

#### Scenario: Recording links without changing targets
- **WHEN** SpecOrbit records a link between a workspace and a local repo or folder
- **THEN** it SHALL store the link in workspace state
- **AND** it SHALL not create, copy, move, initialize, or edit files inside the linked repo or folder

### Requirement: Planning Before Implementation
SpecOrbit SHALL treat workspace creation and detection as planning setup, not implementation.

#### Scenario: Creating or detecting a workspace
- **WHEN** a workspace exists
- **THEN** SpecOrbit SHALL treat it as a place for workspace-level planning
- **AND** repo implementation files SHALL remain unchanged until an explicit implementation workflow runs

#### Scenario: Deferring repo implementation
- **WHEN** repo-local implementation, apply, verify, or archive behavior is needed
- **THEN** that behavior SHALL require an explicit later workspace workflow

### Requirement: Repo Ownership Boundaries
SpecOrbit SHALL keep repo ownership legible when planning happens in a workspace.

#### Scenario: Planning across owned repos
- **WHEN** a workspace plan refers to behavior owned by a repo or source area
- **THEN** that owner SHALL remain the home for canonical specs and implementation work
- **AND** the workspace SHALL make the cross-boundary plan visible without taking ownership away from that owner

#### Scenario: Drafting before ownership is clear
- **WHEN** cross-repo behavior is still being explored and ownership is not clear
- **THEN** the workspace MAY hold planning notes or draft behavior
- **AND** those drafts SHALL remain distinguishable from canonical repo-owned specs
