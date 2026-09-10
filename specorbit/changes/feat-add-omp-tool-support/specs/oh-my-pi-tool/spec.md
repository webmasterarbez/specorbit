## ADDED Requirements

### Requirement: Oh My Pi command file generation
SpecOrbit SHALL generate command files for Oh My Pi in `.omp/commands/orbit-<id>.md`, one per active workflow command.

Each file SHALL include a YAML frontmatter block with a `description` field. The command body SHALL transform `/orbit:` references to `/orbit-` to match Oh My Pi's filename-based slash command naming (e.g., `orbit-propose.md` → `/orbit-propose`). It SHALL inject `**Provided arguments**: $@` on the line immediately following any `**Input**:` heading, unless `$@` or `$ARGUMENTS` is already present in the body.

#### Scenario: Command file path follows OMP convention
- **WHEN** SpecOrbit generates a command file for Oh My Pi for workflow command `propose`
- **THEN** the file is written to `.omp/commands/orbit-propose.md`

#### Scenario: Command file format includes description frontmatter
- **WHEN** SpecOrbit writes a command file for Oh My Pi
- **THEN** the file begins with a YAML frontmatter block containing only a `description` field
- **AND** the body follows the closing `---`

#### Scenario: Command body uses hyphen-based references
- **WHEN** SpecOrbit writes a command file for Oh My Pi whose body contains `/orbit:apply` or similar colon-style references
- **THEN** those references are transformed to `/orbit-apply` in the output file

#### Scenario: Command body exposes user arguments via $@
- **WHEN** SpecOrbit writes a command file for Oh My Pi whose body contains a `**Input**:` heading and no existing `$@` or `$ARGUMENTS` reference
- **THEN** `**Provided arguments**: $@` is injected on the line immediately after the `**Input**:` heading
- **AND** when the user invokes `/orbit-propose my-feature`, the agent receives `my-feature` as the value of `$@`

### Requirement: Oh My Pi skill file generation
SpecOrbit SHALL generate skill files for Oh My Pi in `.omp/skills/specorbit-<id>/SKILL.md`, one per active workflow command.

Skill file bodies SHALL have `/orbit:` references transformed to `/orbit-` so that skill invocations refer to the correct hyphen-based slash command names.

#### Scenario: Skill file path follows OMP convention
- **WHEN** SpecOrbit generates a skill file for Oh My Pi for workflow command `explore`
- **THEN** the file is written to `.omp/skills/specorbit-explore/SKILL.md`

#### Scenario: Skill body uses hyphen-based references
- **WHEN** SpecOrbit writes a skill file for Oh My Pi whose body contains `/orbit:explore`
- **THEN** the reference is transformed to `/orbit-explore` in the output file

### Requirement: Oh My Pi tool detection
SpecOrbit SHALL detect an Oh My Pi installation when the `.omp/` directory exists at the project root, and SHALL present Oh My Pi as a selectable tool in `specorbit init` and `specorbit update`.

#### Scenario: Auto-detection when .omp directory exists
- **WHEN** the project root contains a `.omp/` directory
- **THEN** Oh My Pi is listed as a detected tool during `specorbit init` and `specorbit update`

#### Scenario: Oh My Pi appears in the tool selection list
- **WHEN** a user runs `specorbit init` interactively
- **THEN** Oh My Pi appears as a selectable option in the tool list
