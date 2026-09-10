## Context

The experimental workflow (Orbit) provides a complete lifecycle for creating changes:
- `/orbit:new` - Scaffold a new change with schema
- `/orbit:continue` - Create next artifact
- `/orbit:ff` - Fast-forward all artifacts
- `/orbit:apply` - Implement tasks
- `/orbit:sync` - Sync delta specs to main

The missing piece is archiving. The existing `specorbit archive` command works but:
1. Applies specs programmatically (not agent-driven)
2. Doesn't use the artifact graph for completion checking
3. Doesn't integrate with the Orbit workflow philosophy

## Goals / Non-Goals

**Goals:**
- Add `/orbit:archive` skill to complete the Orbit workflow lifecycle
- Use artifact graph for schema-aware completion checking
- Integrate with `/orbit:sync` for agent-driven spec syncing
- Preserve `.specorbit.yaml` schema metadata in archive

**Non-Goals:**
- Replacing the existing `specorbit archive` CLI command
- Changing how specs are applied in the CLI command
- Modifying the artifact graph or schema system

## Decisions

### Decision 1: Skill-only implementation (no new CLI command)

The `/orbit:archive` will be a slash command/skill only, not a new CLI command.

**Rationale**: The existing `specorbit archive` CLI command already handles the core archive functionality (moving to archive folder, date prefixing). The Orbit version just needs different pre-archive checks and optional sync prompting, which are agent behaviors better suited to a skill.

**Alternatives considered**:
- Adding flags to `specorbit archive` (e.g., `--experimental`) - Rejected: adds complexity to CLI, harder to maintain two code paths
- New CLI command `specorbit archive-experimental` - Rejected: unnecessary duplication, agent skills are the Orbit pattern

### Decision 2: Prompt for sync before archive

The skill will check for unsynced delta specs and prompt the user before archiving.

**Rationale**: The Orbit philosophy is agent-driven intelligent merging via `/orbit:sync`. Rather than programmatically applying specs like the regular archive command, we prompt the user to sync first if needed. This maintains workflow flexibility (user can decline and just archive).

**Flow**:
1. Check if `specs/` directory exists in the change
2. If yes, ask: "This change has delta specs. Would you like to sync them to main specs before archiving?"
3. If user says yes, execute `/orbit:sync` logic
4. Proceed with archive regardless of answer

### Decision 3: Use artifact graph for completion checking

The skill will use `specorbit status --change "<name>" --json` to check artifact completion instead of just validating proposal.md and specs.

**Rationale**: The experimental workflow is schema-aware. Different schemas have different required artifacts. The artifact graph knows which artifacts are complete/incomplete for the current schema.

**Behavior**:
- Show warning if any artifacts are not `done`
- Don't block archive (user may have valid reasons to archive early)
- List incomplete artifacts so user can make informed decision

### Decision 4: Reuse tasks.md completion check from regular archive

The skill will parse tasks.md and warn about incomplete tasks, same as regular archive.

**Rationale**: Task completion checking is valuable regardless of workflow. The logic is simple (count `- [ ]` vs `- [x]`) and doesn't need special Orbit handling.

### Decision 5: Move change to archive/ with date prefix

Same archive behavior as regular command: move to `specorbit/changes/archive/YYYY-MM-DD-<name>/`.

**Rationale**: Consistency with existing archive convention. The `.specorbit.yaml` file moves with the change, preserving schema metadata.

## Risks / Trade-offs

**Risk**: Users confused about when to use `/orbit:archive` vs `specorbit archive`
→ **Mitigation**: Documentation should clarify: use `/orbit:archive` if you've been using the Orbit workflow, use `specorbit archive` otherwise. Both produce the same archived result.

**Risk**: Incomplete sync if user declines and has delta specs
→ **Mitigation**: The prompt is informational; user has full control. They may want to archive without syncing (e.g., abandoned change). Log a note in output.

**Trade-off**: No programmatic spec application in Orbit archive
→ **Accepted**: This is intentional. Orbit philosophy is agent-driven merging. If user wants programmatic application, use `specorbit archive` instead.
