## 1. Create Slash Command

- [x] 1.1 Create `.claude/commands/orbit/archive.md` with skill definition
- [x] 1.2 Add YAML frontmatter (name, description, category, tags)
- [x] 1.3 Implement change selection logic (prompt if not provided)
- [x] 1.4 Implement artifact completion check using `specorbit status --json`
- [x] 1.5 Implement task completion check (parse tasks.md for `- [ ]`)
- [x] 1.6 Implement spec sync prompt (check for specs/ directory, offer `/orbit:sync`)
- [x] 1.7 Implement archive process (move to archive/YYYY-MM-DD-<name>/)
- [x] 1.8 Add output formatting for success/warning cases

## 2. Regenerate Skills

- [x] 2.1 Run `specorbit artifact-experimental-setup` to regenerate skills
- [x] 2.2 Verify skill appears in `.claude/skills/` directory

## 3. Testing

- [x] 3.1 Test `/orbit:archive` with a complete change (all artifacts, all tasks done)
- [x] 3.2 Test `/orbit:archive` with incomplete artifacts (verify warning shown)
- [x] 3.3 Test `/orbit:archive` with incomplete tasks (verify warning shown)
- [x] 3.4 Test `/orbit:archive` with delta specs (verify sync prompt shown)
- [x] 3.5 Test `/orbit:archive` without change name (verify selection prompt)
