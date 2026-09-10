# Update Command Specification

## Purpose

As a developer using SpecOrbit, I want to update the SpecOrbit instructions in my project when new versions are released, so that I can benefit from improvements to AI agent instructions.

## Core Requirements

### Update Behavior

The update command SHALL update SpecOrbit instruction files to the latest templates.

WHEN a user runs `specorbit update` THEN the command SHALL:
- Check if the `specorbit` directory exists
- Replace `specorbit/README.md` with the latest template (complete replacement)
- Update the SpecOrbit-managed block in `CLAUDE.md` using markers
  - Preserve user content outside markers
  - Create `CLAUDE.md` if missing
- Display ASCII-safe success message: "Updated SpecOrbit instructions"

### Prerequisites

The command SHALL require:
- An existing `specorbit` directory (created by `specorbit init`)

IF the `specorbit` directory does not exist THEN:
- Display error: "No SpecOrbit directory found. Run 'specorbit init' first."
- Exit with code 1

### File Handling

The update command SHALL:
- Completely replace `specorbit/README.md` with the latest template
- Update only the SpecOrbit-managed block in `CLAUDE.md` using markers
- Use the default directory name `specorbit`
- Be idempotent (repeated runs have no additional effect)

## Edge Cases

### File Permissions
IF file write fails THEN let the error bubble up naturally with file path.

### Missing CLAUDE.md
IF CLAUDE.md doesn't exist THEN create it with the template content.

### Custom Directory Name
Not supported in this change. The default directory name `specorbit` SHALL be used.

## Success Criteria

Users SHALL be able to:
- Update SpecOrbit instructions with a single command
- Get the latest AI agent instructions
- See clear confirmation of the update

The update process SHALL be:
- Simple and fast (no version checking)
- Predictable (same result every time)
- Self-contained (no network required)