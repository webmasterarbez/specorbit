# CLI Reference

The SpecOrbit CLI (`specorbit`) provides terminal commands for project setup, validation, status inspection, and management. These commands complement the AI slash commands (like `/orbit:propose`) documented in [Commands](commands.md).

## Summary

| Category | Commands | Purpose |
|----------|----------|---------|
| **Setup** | `init`, `update` | Initialize and update SpecOrbit in your project |
| **Stores (standalone SpecOrbit repos)** | `store setup`, `store register`, `store unregister`, `store remove`, `store list`, `store doctor` | Manage stores — standalone SpecOrbit repos you've registered |
| **Health** | `doctor` | Report relationship health for the resolved root |
| **Working context** | `context` | Assemble the working set (root + referenced stores) |
| **Personal worksets** | `workset create`, `workset list`, `workset open`, `workset remove` | Keep and open personal, local working views in your tool |
| **Browsing** | `list`, `view`, `show` | Explore changes and specs |
| **Validation** | `validate` | Check changes and specs for issues |
| **Lifecycle** | `archive` | Finalize completed changes |
| **Workflow** | `new change`, `status`, `instructions`, `templates`, `schemas` | Artifact-driven workflow support |
| **Schemas** | `schema init`, `schema fork`, `schema validate`, `schema which` | Create and manage custom workflows |
| **Config** | `config` | View and modify settings |
| **Utility** | `feedback`, `completion` | Feedback and shell integration |

---

## Human vs Agent Commands

Most CLI commands are designed for **human use** in a terminal. Some commands also support **agent/script use** via JSON output.

### Human-Only Commands

These commands are interactive and designed for terminal use:

| Command | Purpose |
|---------|---------|
| `specorbit init` | Initialize project (interactive prompts) |
| `specorbit view` | Interactive dashboard |
| `specorbit workset open <name>` | Open a saved workset (editor window or terminal agent session) |
| `specorbit config edit` | Open config in editor |
| `specorbit feedback` | Submit feedback via GitHub |
| `specorbit completion install` | Install shell completions |

### Agent-Compatible Commands

These commands support `--json` output for programmatic use by AI agents and scripts:

| Command | Human Use | Agent Use |
|---------|-----------|-----------|
| `specorbit list` | Browse changes/specs | `--json` for structured data |
| `specorbit show <item>` | Read content | `--json` for parsing |
| `specorbit validate` | Check for issues | `--all --json` for bulk validation |
| `specorbit status` | See artifact progress | `--json` for structured status |
| `specorbit instructions` | Get next steps | `--json` for agent instructions |
| `specorbit templates` | Find template paths | `--json` for path resolution |
| `specorbit schemas` | List available schemas | `--json` for schema discovery; `--store <id>` to select a registered root |
| `specorbit store setup <id>` | Create and register a local store | `--json` with explicit inputs for structured setup output |
| `specorbit store register <path>` | Register an existing store | `--json` for structured registration output |
| `specorbit store unregister <id>` | Forget a local store registration | `--json` for structured cleanup output |
| `specorbit store remove <id>` | Delete a registered local store folder | `--yes --json` for non-interactive deletion |
| `specorbit store list` | Browse registered stores | `--json` for structured registrations |
| `specorbit store doctor` | Check local store setup | `--json` for structured diagnostics |
| `specorbit new change <id>` | Create repo-local change scaffolding | `--json`, plus `--store <id>` to use a registered store as the SpecOrbit root |
| `specorbit workset create [name]` | Compose a personal working view | `--member <path> --json` for non-interactive composition |
| `specorbit workset list` | Browse saved worksets | `--json` for structured views |
| `specorbit workset remove <name>` | Delete a saved view | `--yes --json` for non-interactive removal |

---

## Global Options

These options work with all commands:

| Option | Description |
|--------|-------------|
| `--version`, `-V` | Show version number |
| `--no-color` | Disable color output |
| `--help`, `-h` | Display help for command |

---

## Setup Commands

### `specorbit init`

Initialize SpecOrbit in your project. Creates the folder structure and configures AI tool integrations.

Default behavior uses global config defaults: profile `core`, delivery `both`, workflows `propose, explore, apply, update, sync, archive`.

```
specorbit init [path] [options]
```

Use `--language <language>` to add a language instruction to a new project's
`specorbit/config.yaml`. For an existing project, edit the config's `context`
field so SpecOrbit never overwrites project-specific guidance.

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `path` | No | Target directory (default: current directory) |

**Options:**

| Option | Description |
|--------|-------------|
| `--tools <list>` | Configure AI tools non-interactively. Use `all`, `none`, or comma-separated list |
| `--language <language>` | Write artifacts in this language when creating a new config |
| `--force` | Auto-cleanup legacy files without prompting |
| `--profile <profile>` | Override global profile for this init run (`core` or `custom`) |
| `--no-animation` | Show a static welcome screen instead of the animated one |
| `--copilot-cloud` | Set up GitHub Copilot [cloud coding-agent files](supported-tools.md#github-copilot-cloud-coding-agent) without prompting |
| `--no-copilot-cloud` | Skip GitHub Copilot cloud coding-agent files without prompting |

`--profile custom` uses whatever workflows are currently selected in global config (`specorbit config profile`).

The welcome animation is also skipped when the `SPECORBIT_NO_ANIMATION` environment variable is set (any value, including empty), when `NO_COLOR` is set to a non-empty value, or when the OS reduced-motion preference is enabled (macOS Reduce Motion, GNOME animations disabled).

**Supported tool IDs (`--tools`)** — `windsurf` is also accepted, as an alias for `devin`: `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `command-code`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `minimax-code`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `codeassistant`, `qoder`, `qwen`, `rovodev`, `roocode`, `trae`, `zed`, `zcode`, `agents`

> This list mirrors `AI_TOOLS` in `src/core/config.ts`. See [Supported Tools](supported-tools.md) for each tool's skill and command paths.

**Examples:**

```bash
# Interactive initialization
specorbit init

# Initialize in a specific directory
specorbit init ./my-project

# Non-interactive: configure for Claude and Cursor
specorbit init --tools claude,cursor

# Non-interactive: configure global MiniMax Code skills
specorbit init --tools minimax-code

# Configure for all supported tools
specorbit init --tools all

# Override profile for this run
specorbit init --profile core

# Skip prompts and auto-cleanup legacy files
specorbit init --force
```

**What it creates:**

```
specorbit/
├── specs/              # Your specifications (source of truth)
├── changes/            # Proposed changes
└── config.yaml         # Project configuration

.claude/skills/         # Claude Code skills (if claude selected)
.cursor/skills/         # Cursor skills (if cursor selected)
.cursor/commands/       # Cursor Orbit commands (if delivery includes commands)
.agents/skills/         # Shared skills for AGENTS.md-compatible tools (if agents selected)
... (other tool configs)
```

---

### `specorbit update`

Update SpecOrbit instruction files after upgrading the CLI. Re-generates AI tool configuration files using your current global profile, selected workflows, and delivery mode.

```
specorbit update [path] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `path` | No | Target directory (default: current directory) |

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Force update even when files are up to date |

**Example:**

```bash
# Update instruction files after npm upgrade
npm install -g specorbit@latest
specorbit update
```

Upgrade the package first. Instruction files are generated by the installed CLI, so running `specorbit update` against a stale install reports everything up to date without adding the workflows newer releases ship.

To make that visible, `specorbit update` asks the npm registry whether a newer CLI has been published. When yours is behind, it offers to upgrade:

```text
A newer SpecOrbit CLI is available (v1.6.0 → v1.7.0).
  Running from: /usr/local/lib/node_modules/specorbit
? Upgrade to v1.7.0 now? (Y/n)
```

Answer yes and it runs `npm install -g specorbit@latest`, then re-runs the update with the new CLI so the new workflows land in the same command. It confirms the upgrade by asking the installed binary its version rather than trusting npm's exit code, so if another install earlier on your `PATH` is still answering, it tells you instead of claiming success. Answer no and it prints the command and updates with the CLI you have. Ctrl-C stops the command.

The offer appears only in an interactive terminal, and only when npm owns the install — the one case `npm install -g` actually fixes. Everything else gets the command that matches how it was installed instead:

| How SpecOrbit is installed | What you get |
|---------------------------|--------------|
| Global npm install | The prompt, and the upgrade run for you — in an interactive terminal; piped output gets the printed command instead |
| Global pnpm, bun, yarn, or volta install | That manager's own command: `pnpm add -g …@latest`, `bun add -g …@latest`, `yarn global add …@latest`, or `volta install …@latest` |
| A dependency of the project | A note to update the dependency, since its package manager owns the lockfile |
| An `npx` / `dlx` cache | `npx specorbit@latest update` — that command is the update, so there is no second step |
| A git clone | Nothing — your version is whatever the branch says |

Whenever anything is printed, it names the directory the running CLI was loaded from — the thing to check when you did upgrade but a stale shim still owns your `PATH`.

It asks the registry in `npm_config_registry` when npm exports it, and `https://registry.npmjs.org` otherwise. No `.npmrc` is read: letting file contents choose where an outbound request goes is a flow worth avoiding, and a project's `.npmrc` travels with the repository. On a private mirror, export `npm_config_registry` — or set `SPECORBIT_NO_UPDATE_CHECK` to skip the check entirely. The check is skipped when `CI` is set to anything but an explicit off-value (`false`, `0`, `no`, `off`, or empty), under `NODE_ENV=test`, and whenever `SPECORBIT_NO_UPDATE_CHECK` (any value), `DO_NOT_TRACK=1`, or `SPECORBIT_TELEMETRY=0` is set. It runs before the update and can delay it by at most 1.5 seconds — it gives up after that even when the network drops packets silently, and stays quiet when the registry is unreachable.

**How "up to date" is decided:** skill files record the version that generated
them, so SpecOrbit compares that against the installed CLI. Command files carry no
version stamp, so for a tool that has commands but no skills (delivery
`commands`), SpecOrbit compares the file contents against what it would generate
now — edits to those files count as drift and are overwritten. With delivery
`skills` or `both`, only the recorded version is checked, so a hand-edited file
whose version still matches is left alone; use `--force` to rewrite it. Either
way, generated files are SpecOrbit's to own — keep your own instructions
elsewhere.

---

## Stores (standalone SpecOrbit repos)

> **Beta.** Stores and the features built on them (references, working context, worksets) are new; command names, flags, file formats, and JSON output may change shape between releases. For the problem-first walkthrough, see the [stores guide](stores-beta/user-guide.md).

A store is a standalone SpecOrbit repo you've registered on this machine — for example a planning repo or a contracts repo. Registering a store lets normal commands (`list`, `show`, `status`, `validate`, `new change`, `archive`, ...) act in it from anywhere by passing `--store <id>`.

### `specorbit store setup`

Create and register a local store. With no arguments in a terminal,
SpecOrbit guides the user through setup. Agents and scripts should pass explicit
inputs and use `--json`.

```bash
specorbit store setup [id] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--path <path>` | Folder where the store should live (for example `~/specorbit/<id>`) |
| `--remote <url>` | Record the canonical remote in the new store's `store.yaml` |
| `--init-git` | Initialize a Git repository with an initial commit (default) |
| `--no-init-git` | Skip every Git action: no init, no initial commit |
| `--json` | Output JSON |

Non-interactive runs (`--json`, scripts, agents) must pass both the store id and `--path`. In an interactive terminal, setup prompts for the location with an editable suggestion in a visible, user-owned place (for example `~/specorbit/<id>`); it never defaults to SpecOrbit's managed data directory.

Examples:

```bash
specorbit store setup
specorbit store setup team-context
specorbit store setup team-context --path ~/specorbit/team-context --no-init-git
specorbit store setup team-context --path ~/specorbit/team-context --no-init-git --json
```

### `specorbit store register`

Register an existing local store folder. During the stores beta, a root may be
registered before any changes exist, specs have been applied, or changes have
been archived; in that case `specorbit/changes/`, `specorbit/specs/`, and
`specorbit/changes/archive/` may be absent until normal commands create them.
A config-only repo that declares `store: <id>` remains a pointer to another
store and is not registered as a store root unless that pointer is removed.

```bash
specorbit store register [path] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--id <id>` | Store id; defaults to store metadata or folder name |
| `--yes` | Confirm creating store identity metadata for a healthy SpecOrbit root |
| `--json` | Output JSON |

### `specorbit store unregister`

Forget a local store registration without deleting files.

```bash
specorbit store unregister <id> [--json]
```

Use this when a store was moved, cloned somewhere else, or should no longer be
shown by SpecOrbit on this machine.

### `specorbit store remove`

Forget a local store registration and delete its local folder.

```bash
specorbit store remove <id> [--yes] [--json]
```

`remove` shows the exact folder before deleting in an interactive terminal.
Agents, scripts, and JSON callers must pass `--yes` to confirm deletion.
SpecOrbit refuses to delete a folder that does not contain matching
store metadata.

### `specorbit store list`

List locally registered stores.

```bash
specorbit store list [--json]
specorbit store ls [--json]
```

### `specorbit store doctor`

Check local store registration, metadata, and Git presence.

```bash
specorbit store doctor [id] [--json]
```

Doctor is diagnostic-only; it reports missing roots, metadata mismatches, and invalid local registry state without modifying the store.

### Referencing stores from a project

A project repo can declare which stores its work draws on in `specorbit/config.yaml`:

```yaml
schema: spec-driven
references:
  - team-context
```

From then on, `specorbit instructions` output in that repo (both the per-artifact and `apply` surfaces, JSON and human modes) carries an index of each referenced store's specs — spec ids, a one-line summary from each spec's Purpose section, and the fetch command (`specorbit show <spec-id> --type spec --store <id>`). The index is built live from the registered checkout on every run; spec content is never copied into the output.

References are read-only context. They never change where commands act: work stays in the repo's own root, and writing to a referenced store remains an explicit `--store` action. A reference that cannot be resolved (for example, a store not registered on this machine) degrades to a warning in the index with the exact fix, and instructions still generate. `specorbit doctor` reports reference health in one place.

### Recording where a store is cloned from

A store can record its canonical clone source in its committed identity file, so onboarding never dead-ends at "register the store":

```bash
specorbit store setup team-context --path ~/specorbit/team-context \
  --remote git@github.com:acme/team-context.git
```

The remote lands in `.specorbit-store/store.yaml` inside the initial commit, so every clone is born knowing it. For an existing store, edit `store.yaml` by hand and commit. `store doctor` shows the recorded remote (and the checkout's observed Git origin); setup/register sharing guidance names it; and register records the checkout's origin in the machine-local registry.

A reference declaration can carry the clone source too, so a teammate who doesn't have the store yet gets a complete, pasteable fix (`git clone <remote> <path> && specorbit store register <path> --id <id>`):

```yaml
references:
  - { id: team-context, remote: "git@github.com:acme/team-context.git" }
```

Recording a remote is not sync: SpecOrbit never clones, pulls, or pushes on its own.

### Declaring a default store

A repo whose planning is fully externalized — no local `specorbit/specs/` or `specorbit/changes/` — can declare its store once instead of passing `--store` on every command:

```yaml
# specorbit/config.yaml (the only file under specorbit/)
store: team-context
```

Normal commands then resolve to the declared store automatically; the root banner and JSON `root` block report `source: "declared"` with the store id, and printed hints still carry `--store <id>`. The declaration is a fallback, never an override: explicit `--store` always wins, and a directory with real planning folders ignores the pointer (with a warning). To convert a pointer repo into a local SpecOrbit root, remove the `store:` line and run `specorbit init` — init refuses to scaffold while the declaration is present.

A machine-level variant covers every repo at once: `specorbit config set defaultStore <id>` (see Configuration). It is consulted only after `--store`, a local root, and a project pointer have all failed to resolve; the root banner and JSON `root` block then report `source: "global_default"`.

## Doctor (relationship health)

One read-only question, one place: is the SpecOrbit root healthy, and are the stores it references available on this machine?

```bash
specorbit doctor [--store <id>] [--json]
```

The report separates root health, store metadata health (including a note when the recorded remote and the checkout's origin diverge, and a note when the store checkout has drifted behind its last-fetched upstream tracking ref), and reference health (the same diagnostics instructions show, with clone fixes for unresolved references). Health findings of any severity exit 0 — agents read the `status` arrays; only command failures (no root, unknown store) exit 1. Doctor never clones, syncs, or repairs. To get the assembled set itself rather than its health, use `specorbit context`.

## Working context (the assembled set)

Everything this work relates to through SpecOrbit declarations, in one working set: the SpecOrbit root and the stores it references.

```bash
specorbit context [--store <id>] [--json] [--code-workspace <path> [--force]]
```

The JSON brief is agent-consumable (each available referenced store carries its fetch recipe; unresolved members carry the same fixes instructions and doctor show). `--code-workspace` additionally writes a VS Code workspace file containing the root plus the available referenced stores (`ref:<id>` folders) — the one write this command performs, refused without `--force` if the file exists. Unavailable members are reported, never guessed at.

"Working context" is the assembled set; the `context:` field in `specorbit/config.yaml` is project background injected into instructions — two different things. `specorbit doctor` answers whether the set is healthy; `specorbit context` answers what the set is.

## Personal worksets

> **Beta.** Worksets are part of the new beta surface; commands, flags, and file formats may change shape between releases. For the walkthrough, see the [stores guide](stores-beta/user-guide.md#worksets-reopen-the-folders-you-work-on-together).

A workset is a personal, named view of the folders you work on together — a planning root plus whatever else you choose — kept on your machine and reopened by name in your tool. It is purely local: never committed, never shared, never derived from declarations, and removing one never touches a member folder.

```bash
specorbit workset create [name] [--member <path> | --member <name>=<path>]... [--tool <id>] [--json]
specorbit workset list [--json]
specorbit workset open <name> [--tool <id>]
specorbit workset remove <name> [--yes] [--json]
```

`create` runs a short guided flow (or takes `--member` flags non-interactively; the first member is the primary — sessions start there). `open` launches the chosen tool: editors (VS Code, Cursor) open a window with every member and return; CLI agents (Claude Code, codex) take over this terminal as a session with every member attached and no prompt pre-filled, ending when you exit. A member folder missing at open time is skipped with a note; the rest opens. The saved tool preference is overridable per open with `--tool`.

Supporting a new tool is configuration, not code. Every tool is one of two launch styles — `workspace-file` (launched with the generated `.code-workspace`) or `attach-dirs` (one attach flag per member) — and the `openers` key in the global `config.json` (open it with `specorbit config edit`) adds tools or adjusts built-ins per field:

```json
{
  "openers": {
    "zed": { "style": "workspace-file" },
    "claude": { "attach_flag": "--dir" }
  }
}
```

All workset state lives under the global data dir's `worksets/` folder (the saved views plus the generated `<name>.code-workspace` files, regenerated on every open); deleting that folder removes every trace.

---

## Browsing Commands

### `specorbit list`

List changes or specs in your project.

```
specorbit list [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--specs` | List specs instead of changes |
| `--changes` | List changes (default) |
| `--sort <order>` | Sort by `recent` (default) or `name` |
| `--json` | Output as JSON |

**Examples:**

```bash
# List all active changes
specorbit list

# List all specs
specorbit list --specs

# JSON output for scripts
specorbit list --json
```

**Output (text):**

```
Changes:
  add-dark-mode     No tasks      just now
```

---

### `specorbit view`

Display an interactive dashboard for exploring specs and changes.

```
specorbit view
```

Opens a terminal-based interface for navigating your project's specifications and changes.

---

### `specorbit show`

Display details of a change or spec.

```
specorbit show [item-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `item-name` | No | Name of change or spec (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--type <type>` | Specify type: `change` or `spec` (auto-detected if unambiguous) |
| `--json` | Output as JSON |
| `--no-interactive` | Disable prompts |

**Change-specific options:**

| Option | Description |
|--------|-------------|
| `--deltas-only` | Show only delta specs (JSON mode) |

**Spec-specific options:**

| Option | Description |
|--------|-------------|
| `--requirements` | Show only requirements, exclude scenarios (JSON mode) |
| `--no-scenarios` | Exclude scenario content (JSON mode) |
| `-r, --requirement <id>` | Show specific requirement by 1-based index (JSON mode) |

**Examples:**

```bash
# Interactive selection
specorbit show

# Show a specific change
specorbit show add-dark-mode

# Show a specific spec
specorbit show auth --type spec

# JSON output for parsing
specorbit show add-dark-mode --json
```

---

## Validation Commands

### `specorbit validate`

Validate changes and specs for structural issues, and check a change's MODIFIED requirements against the main specs they would replace.

```
specorbit validate [item-name] [options]
```

A change with zero spec deltas fails validation unless its `.specorbit.yaml` declares `skip_specs: true` (for pure refactors, tooling, or docs work — see [Recipe 5](examples.md#recipe-5-a-refactor-with-no-behavior-change)).

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `item-name` | No | Specific item to validate (prompts if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | Validate all changes and specs |
| `--changes` | Validate all changes |
| `--specs` | Validate all specs |
| `--archived` | Validate that archived changes have all tasks completed (for pre-commit linting) |
| `--type <type>` | Specify type when name is ambiguous: `change` or `spec` |
| `--strict` | Enable strict validation mode |
| `--json` | Output as JSON |
| `--concurrency <n>` | Max parallel validations (default: 6, or `SPECORBIT_CONCURRENCY` env) |
| `--no-interactive` | Disable prompts |

`--archived` is its own scope: it does not validate spec deltas (already applied at archive time), it verifies that every change under `changes/archive/` has all of its `tasks.md` checkboxes ticked, exiting non-zero if any are unchecked. This catches changes that were archived with unfinished work — handy in a pre-commit hook.

**Examples:**

```bash
# Interactive validation
specorbit validate

# Validate a specific change
specorbit validate add-dark-mode

# Validate all changes
specorbit validate --changes

# Validate everything with JSON output (for CI/scripts)
specorbit validate --all --json

# Strict validation with increased parallelism
specorbit validate --all --strict --concurrency 12

# Fail if any archived change still has unchecked tasks
specorbit validate --archived
```

**Output (text):**

```
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
```

**Output (JSON):**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## Lifecycle Commands

### `specorbit archive`

Archive a completed change and merge delta specs into main specs.

```
specorbit archive [change-name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `change-name` | No | Change to archive (prompts if omitted; required when nothing can answer the prompt) |

**Options:**

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts. Required when nothing can answer them — an AI agent, a CI job, or any run with stdin closed |
| `--skip-specs` | Skip spec updates for one archive run. A change that permanently has no spec deltas should declare `skip_specs: true` in its `.specorbit.yaml` instead — it archives with no flag |
| `--no-validate` | Skip validation (requires confirmation). Also disables capability retirement — with no validator verdict, nothing is retired |

**Examples:**

```bash
# Interactive archive (asks which change, then confirms)
specorbit archive

# Archive specific change
specorbit archive add-dark-mode

# Archive without prompts (agents, CI, scripts)
specorbit archive add-dark-mode --yes

# Archive a tooling change that doesn't affect specs
specorbit archive update-ci-config --skip-specs
```

**Retire a capability:** Add the retirement marker to the change metadata:

```yaml
# specorbit/changes/retire-legacy/.specorbit.yaml
schema: spec-driven
retire_capabilities: true
```

Then archive the change normally:

```bash
specorbit archive retire-legacy --yes
```

When the change removes the capability's last requirement, SpecOrbit deletes its
live `spec.md`. Other capability deltas in the same change still update their
main specs. Without the marker, archive stops before changing any files and
tells you to add it.

**What it does:**

1. Validates the change (unless `--no-validate`)
2. Prompts for confirmation (unless `--yes`)
3. Claims the archive destination before changing any main spec
4. Validates and merges the active delta specs into `specorbit/specs/` — a capability whose last requirement the change removes is retired, and its spec file deleted, but only when the change's `.specorbit.yaml` declares `retire_capabilities: true` next to its `schema:`
5. Moves the change folder to `specorbit/changes/archive/YYYY-MM-DD-<name>/`
6. If a spec mutation or final move fails before a complete archive is secured, restores the specs and leaves or returns the change at its active path
7. If a verified fallback copy completes but staged-source cleanup fails, retains the complete archive and committed spec state for recovery

**Without a terminal:** an AI agent, a CI job, or any run with stdin closed cannot
answer step 2, so archive stops before touching anything, exits 1, and names the
command to rerun — `specorbit archive <name> --yes`, carrying whatever other flags
you passed. Pass `--yes` (and the change name) up front to skip the round trip.

---

## Workflow Commands

These commands support the artifact-driven Orbit workflow. They're useful for both humans checking progress and agents determining next steps.

### `specorbit new change`

Create a change directory and optional checked-in metadata in the resolved SpecOrbit root.

```bash
specorbit new change <name> [options]
```

Change names must use lowercase kebab-case: lowercase letters, numbers, and
single hyphens. They cannot contain spaces, underscores, uppercase letters,
consecutive hyphens, or leading/trailing hyphens. A leading number is allowed,
so you can prefix names to order or tier changes, for example `100-add-feature`
or `00001-add-auth`.

**Options:**

| Option | Description |
|--------|-------------|
| `--description <text>` | Description to add to `README.md` |
| `--goal <text>` | Optional goal metadata to store with the change |
| `--schema <name>` | Workflow schema to use |
| `--store <id>` | Store id to use as the SpecOrbit root (a store is a standalone SpecOrbit repo you've registered) |
| `--json` | Output JSON |

Examples:

```bash
specorbit new change add-billing-api
specorbit new change add-billing-api --store team-context --json
```

### `specorbit status`

Display artifact completion status for a change.

```
specorbit status [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--change <id>` | Change name (prompts if omitted) |
| `--schema <name>` | Schema override (auto-detected from change's config) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Interactive status check
specorbit status

# Status for specific change
specorbit status --change add-dark-mode

# JSON for agent use
specorbit status --change add-dark-mode --json
```

**Output (text):**

```
Change: add-dark-mode
Schema: spec-driven
Progress: 2/4 artifacts complete

[x] proposal
[x] specs
[ ] design
[-] tasks (blocked by: design)
```

A change that declares `skip_specs: true` shows its specs stage as `[~] specs (skipped: change declares skip_specs)` and excludes it from the progress count.

**Output (JSON):**

```json
{
  "changeName": "add-dark-mode",
  "schemaName": "spec-driven",
  "isPlanningComplete": false,
  "isComplete": false,
  "applyRequires": ["tasks"],
  "artifacts": [
    {"id": "proposal", "outputPath": "proposal.md", "status": "done", "requires": []},
    {"id": "specs", "outputPath": "specs/**/*.md", "status": "done", "requires": ["proposal"]},
    {"id": "design", "outputPath": "design.md", "status": "ready", "requires": ["proposal"]},
    {"id": "tasks", "outputPath": "tasks.md", "status": "blocked", "requires": ["specs", "design"], "missingDeps": ["design"]}
  ]
}
```

`isPlanningComplete` reports whether every non-skipped planning artifact exists;
skipped artifacts count as satisfied without being created. It does not report
whether implementation tasks are complete. `isComplete` is retained as a
compatibility alias with the same value.

Artifacts are listed in dependency order - a dependency never appears after
something that requires it - and artifacts that become ready at the same time
(spec-driven's `specs` and `design` both need only `proposal`) keep the order the
schema declares them rather than an alphabetical one. So the first `ready` entry
is the artifact to write next.

---

### `specorbit instructions`

Get enriched instructions for creating an artifact or applying tasks. Used by AI agents to understand what to create next.

```
specorbit instructions [artifact] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `artifact` | No | Artifact ID, or workflow input surface: `apply` or `archive` |

**Options:**

| Option | Description |
|--------|-------------|
| `--change <id>` | Change name (required in non-interactive mode) |
| `--schema <name>` | Schema override |
| `--json` | Output as JSON |

**Special cases:** Use `apply` to get task implementation instructions. Use
`archive` to fetch current, read-only archive inputs (`context` and
`operationGuidance`) for a valid change; it does not archive or mutate anything.

**Examples:**

```bash
# Get instructions for next artifact
specorbit instructions --change add-dark-mode

# Get specific artifact instructions
specorbit instructions design --change add-dark-mode

# Get apply/implementation instructions
specorbit instructions apply --change add-dark-mode

# Get current archive operation inputs without archiving
specorbit instructions archive --change add-dark-mode --json

# JSON for agent consumption
specorbit instructions design --change add-dark-mode --json
```

**Output includes:**

- Template content for the artifact
- Project context from config
- Content from dependency artifacts
- Per-artifact rules from config
- Current project context and matching operation guidance for `apply`/`archive`

Operation inputs are read from the resolved repo or selected store on every
invocation. Project context is a required prompt-level input: agents read it and
apply relevant project facts, conventions, and constraints. Operation guidance is
optional additive advice: agents consider every entry and follow only entries that
are applicable and compatible with the built-in workflow. Both fields remain
separate from explicit user choices, CLI-controlled state, built-in instructions,
and artifact rules. Conflicting context is reported; conflicting or inapplicable
guidance is not followed and the reason is explained. These are behavioral
contracts for generated agents, not enforceable CLI checks. `instructions archive`
returns only the selected change, optional inputs, and root metadata; it does not
include the static archive workflow.

For an artifact skipped via `skip_specs: true`, the output is a warning only (JSON adds `skipped`/`warning` fields) — the artifact must not be created.

---

### `specorbit templates`

Show resolved template paths for all artifacts in a schema.

```
specorbit templates [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--schema <name>` | Schema to inspect (default: `spec-driven`) |
| `--json` | Output as JSON |

**Examples:**

```bash
# Show template paths for default schema
specorbit templates

# Show templates for custom schema
specorbit templates --schema my-workflow

# JSON for programmatic use
specorbit templates --json
```

**Output (text):**

```
Schema: spec-driven

Templates:
  proposal  → ~/.specorbit/schemas/spec-driven/templates/proposal.md
  specs     → ~/.specorbit/schemas/spec-driven/templates/specs.md
  design    → ~/.specorbit/schemas/spec-driven/templates/design.md
  tasks     → ~/.specorbit/schemas/spec-driven/templates/tasks.md
```

---

### `specorbit schemas`

List available workflow schemas with their descriptions and artifact flows.

```
specorbit schemas [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--json` | Output as JSON |
| `--store <id>` | Use a registered store as the SpecOrbit root |

**Example:**

```bash
specorbit schemas
```

**Output:**

```
Available schemas:

  spec-driven (package)
    The default spec-driven development workflow
    Flow: proposal → specs → design → tasks

  my-custom (project)
    Custom workflow for this project
    Flow: research → proposal → tasks
```

---

## Schema Commands

Commands for creating and managing custom workflow schemas.

### `specorbit schema init`

Create a new project-local schema.

```
specorbit schema init <name> [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | Yes | Schema name (kebab-case) |

**Options:**

| Option | Description |
|--------|-------------|
| `--description <text>` | Schema description |
| `--artifacts <list>` | Comma-separated artifact IDs (default: `proposal,specs,design,tasks`) |
| `--default` | Set as project default schema |
| `--no-default` | Don't prompt to set as default |
| `--force` | Overwrite existing schema |
| `--json` | Output as JSON |

**Examples:**

```bash
# Interactive schema creation
specorbit schema init research-first

# Non-interactive with specific artifacts
specorbit schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**What it creates:**

```
specorbit/schemas/<name>/
├── schema.yaml           # Schema definition
└── templates/
    ├── proposal.md       # Template for each artifact
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `specorbit schema fork`

Copy an existing schema to your project for customization.

```
specorbit schema fork <source> [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `source` | Yes | Schema to copy |
| `name` | No | New schema name (default: `<source>-custom`) |

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Overwrite existing destination |
| `--json` | Output as JSON |

**Example:**

```bash
# Fork the built-in spec-driven schema
specorbit schema fork spec-driven my-workflow
```

---

### `specorbit schema validate`

Validate a schema's structure and templates.

```
specorbit schema validate [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Schema to validate (validates all if omitted) |

**Options:**

| Option | Description |
|--------|-------------|
| `--verbose` | Show detailed validation steps |
| `--json` | Output as JSON |

**Example:**

```bash
# Validate a specific schema
specorbit schema validate my-workflow

# Validate all schemas
specorbit schema validate
```

---

### `specorbit schema which`

Show where a schema resolves from (useful for debugging precedence).

```
specorbit schema which [name] [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `name` | No | Schema name |

**Options:**

| Option | Description |
|--------|-------------|
| `--all` | List all schemas with their sources |
| `--json` | Output as JSON |

**Example:**

```bash
# Check where a schema comes from
specorbit schema which spec-driven
```

**Output:**

```
spec-driven resolves from: package
  Source: /usr/local/lib/node_modules/specorbit/schemas/spec-driven
```

**Schema precedence:**

1. Project: `specorbit/schemas/<name>/`
2. User: `~/.local/share/specorbit/schemas/<name>/`
3. Package: Built-in schemas

---

## Configuration Commands

### `specorbit config`

View and modify global SpecOrbit configuration.

```
specorbit config <subcommand> [options]
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `path` | Show config file location |
| `list` | Show all current settings |
| `get <key>` | Get a specific value |
| `set <key> <value>` | Set a value |
| `unset <key>` | Remove a key |
| `reset` | Reset to defaults |
| `edit` | Open in `$EDITOR` |
| `profile [preset]` | Configure workflow profile interactively or via preset |

**Examples:**

```bash
# Show config file path
specorbit config path

# List all settings
specorbit config list

# Get a specific value
specorbit config get telemetry.enabled

# Set a value (disable anonymous usage telemetry)
specorbit config set telemetry.enabled false

# Set a string value explicitly
specorbit config set user.name "My Name" --string

# Remove a custom setting
specorbit config unset user.name

# Set a machine-level default store (fallback root when no --store,
# local root, or project store: pointer resolves)
specorbit config set defaultStore team-plans

# Reset all configuration
specorbit config reset --all --yes

# Edit config in your editor
specorbit config edit

# Configure profile with action-based wizard
specorbit config profile

# Fast preset: switch workflows to core (keeps delivery mode)
specorbit config profile core
```

**Telemetry opt-out:** `telemetry.enabled` defaults to on when unset (opt-out model).
Set it to `false` to disable anonymous usage stats and the `specorbit update` version check.
Environment variables take precedence over config: `SPECORBIT_TELEMETRY=0`, `DO_NOT_TRACK=1`,
and a truthy `CI` value (e.g. `true`/`1`/`yes`) always disable telemetry regardless of the config value.

`specorbit config profile` starts with a current-state summary, then lets you choose:
- Change delivery + workflows
- Change delivery only
- Change workflows only
- Keep current settings (exit)

If you keep current settings, no changes are written and no update prompt is shown.
If there are no config changes but the current project files are out of sync with your global profile/delivery, SpecOrbit will show a warning and suggest `specorbit update`.
Pressing `Ctrl+C` also cancels the flow cleanly (no stack trace) and exits with code `130`.
In the workflow checklist, `[x]` means the workflow is selected in global config. To apply those selections to project files, run `specorbit update` (or choose `Apply changes to this project now?` when prompted inside a project).

**Interactive examples:**

```bash
# Delivery-only update
specorbit config profile
# choose: Change delivery only
# choose delivery: Skills only

# Workflows-only update
specorbit config profile
# choose: Change workflows only
# toggle workflows in the checklist, then confirm
```

---

## Utility Commands

### `specorbit feedback`

Submit feedback about SpecOrbit. Creates a GitHub issue.

```
specorbit feedback <message> [options]
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `message` | Yes | Feedback summary; long text is shortened in the issue title and preserved in the body |

**Options:**

| Option | Description |
|--------|-------------|
| `--body <text>` | Additional details included after the summary |

**Requirements:** GitHub CLI (`gh`) must be installed and authenticated.

**Example:**

```bash
specorbit feedback "Add support for custom artifact types" \
  --body "I'd like to define my own artifact types beyond the built-in ones."
```

---

### `specorbit completion`

Manage shell completions for the SpecOrbit CLI.

```
specorbit completion <subcommand> [shell]
```

**Subcommands:**

| Subcommand | Description |
|------------|-------------|
| `generate [shell]` | Output completion script to stdout |
| `install [shell]` | Install completion for your shell |
| `uninstall [shell]` | Remove installed completions |

**Supported shells:** `bash`, `zsh`, `fish`, `powershell`

**Examples:**

```bash
# Install completions (auto-detects shell)
specorbit completion install

# Install for specific shell
specorbit completion install zsh

# Generate script for manual installation (bash)
specorbit completion generate bash > ~/.bash_completion.d/specorbit

# Uninstall
specorbit completion uninstall
```

**Windows (PowerShell):** Install completions for the current PowerShell host:

```powershell
$env:PROFILE = $PROFILE
specorbit completion install powershell
. $PROFILE
```

`$env:PROFILE` tells SpecOrbit which profile to configure in this session. The
installer creates missing profile directories and adds a managed block that loads
`SpecOrbitCompletion.ps1`. Reloading the profile enables completions immediately.

To uninstall from the current host, run:

```powershell
$env:PROFILE = $PROFILE
specorbit completion uninstall powershell
```

Restart PowerShell after uninstalling to clear completions from the current session.

Completions are opt-in. The CLI mentions them once, on stderr, the first time you
run a command in an interactive terminal, and never again — it also stays quiet
if you already have completions installed. Set `SPECORBIT_NO_COMPLETIONS=1` to
suppress that tip entirely.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error (validation failure, missing files, etc.) |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SPECORBIT_TELEMETRY` | Set to `0` to disable telemetry and the `specorbit update` version check (overrides `telemetry.enabled` in global config) |
| `DO_NOT_TRACK` | Set to `1` to disable telemetry and the `specorbit update` version check (standard DNT signal; overrides config) |
| `SPECORBIT_CONCURRENCY` | Default concurrency for bulk validation (default: 6) |
| `EDITOR` or `VISUAL` | Editor for `specorbit config edit` |
| `NO_COLOR` | Disable color output when set |
| `SPECORBIT_NO_ANIMATION` | Disable the `specorbit init` welcome animation when set |
| `SPECORBIT_NO_COMPLETIONS` | Set to `1` to suppress the one-time tip about shell completions |
| `SPECORBIT_NO_UPDATE_CHECK` | Disable the `specorbit update` check for a newer published CLI when set (any value, including empty). Also skipped when `CI` is set (unless `false`/`0`/`no`/`off`) or `NODE_ENV=test` |
| `npm_config_registry` | Registry the `specorbit update` version check asks. Must be an `http(s)` URL or it falls back to `https://registry.npmjs.org`. No `.npmrc` file is read |

---

## Related Documentation

- [Commands](commands.md) - AI slash commands (`/orbit:propose`, `/orbit:apply`, etc.)
- [Workflows](workflows.md) - Common patterns and when to use each command
- [Customization](customization.md) - Create custom schemas and templates
- [Getting Started](getting-started.md) - First-time setup guide
