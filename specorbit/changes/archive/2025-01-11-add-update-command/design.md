# Technical Design

## Architecture Decisions

### Simplicity First
- No version tracking - always update when commanded
- Full replacement for SpecOrbit-managed files only (e.g., `specorbit/README.md`)
- Marker-based updates for user-owned files (e.g., `CLAUDE.md`)
- Templates bundled with package - no network required
- Minimal error handling - only check prerequisites

### Template Strategy
- Use existing template utilities
  - `readmeTemplate` from `src/core/templates/readme-template.ts` for `specorbit/README.md`
  - `TemplateManager.getClaudeTemplate()` for `CLAUDE.md`
- Directory name is fixed to `specorbit` (from `SPECORBIT_DIR_NAME`)

### File Operations
- Use async utilities for consistency
  - `FileSystemUtils.writeFile` for `specorbit/README.md`
  - `FileSystemUtils.updateFileWithMarkers` for `CLAUDE.md`
- No atomic operations needed - users have git
- Check directory existence before proceeding

## Implementation

### Update Command (`src/core/update.ts`)
```typescript
export class UpdateCommand {
  async execute(projectPath: string): Promise<void> {
    const specorbitDirName = SPECORBIT_DIR_NAME;
    const specorbitPath = path.join(projectPath, specorbitDirName);

    // 1. Check specorbit directory exists
    if (!await FileSystemUtils.directoryExists(specorbitPath)) {
      throw new Error(`No SpecOrbit directory found. Run 'specorbit init' first.`);
    }

    // 2. Update README.md (full replacement)
    const readmePath = path.join(specorbitPath, 'README.md');
    await FileSystemUtils.writeFile(readmePath, readmeTemplate);

    // 3. Update CLAUDE.md (marker-based)
    const claudePath = path.join(projectPath, 'CLAUDE.md');
    const claudeContent = TemplateManager.getClaudeTemplate();
    await FileSystemUtils.updateFileWithMarkers(
      claudePath,
      claudeContent,
      SPECORBIT_MARKERS.start,
      SPECORBIT_MARKERS.end
    );

    // 4. Success message (ASCII-safe, checkmark optional by terminal)
    console.log('Updated SpecOrbit instructions');
  }
}
```

## Why This Approach

### Benefits
- **Dead simple**: ~40 lines of code total
- **Fast**: No version checks, minimal parsing
- **Predictable**: Same result every time; idempotent
- **Maintainable**: Reuses existing utilities

### Trade-offs Accepted
- No version tracking (unnecessary complexity)
- Full overwrite only for SpecOrbit-managed files
- Marker-managed updates for user-owned files

## Error Handling

Only handle critical errors:
- Missing `specorbit` directory → throw error handled by CLI to present a friendly message
- File write failures → let errors bubble up to CLI

## Testing Strategy

Manual smoke tests are sufficient initially:
1. Run `specorbit init` in a test project
2. Modify both files (including custom content around markers in `CLAUDE.md`)
3. Run `specorbit update`
4. Verify `specorbit/README.md` fully replaced; `CLAUDE.md` SpecOrbit block updated without altering user content outside markers
5. Run the command twice to verify idempotency and no duplicate markers
6. Test with missing `specorbit` directory (expect failure)