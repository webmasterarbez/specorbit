## MODIFIED Requirements

### Requirement: Project Structure
A SpecOrbit project SHALL maintain a consistent directory structure for specifications and changes.

#### Scenario: Initializing project structure

- **WHEN** a SpecOrbit project is initialized
- **THEN** it SHALL have this structure:
```
specorbit/
├── project.md              # Project-specific context
├── AGENTS.md               # AI assistant instructions
├── specs/                  # Current deployed capabilities
│   └── <capability-path>/  # One or more directories for a focused capability
│       ├── spec.md         # WHAT and WHY
│       └── design.md       # HOW (optional, for established patterns)
└── changes/                # Proposed changes
    ├── [change-name]/      # Descriptive change identifier
    │   ├── proposal.md     # Why, what, and impact
    │   ├── tasks.md        # Implementation checklist
    │   ├── design.md       # Technical decisions (optional)
    │   └── specs/          # Complete future state
    │       └── <capability-path>/
    │           └── spec.md # Clean markdown (no diff syntax)
    └── archive/            # Completed changes
        └── YYYY-MM-DD-[name]/
```

### Requirement: Verb–Noun CLI Command Structure
SpecOrbit CLI design SHALL use verbs as top-level commands with nouns provided as arguments or flags for scoping.

#### Scenario: Verb-first command discovery

- **WHEN** a user runs a command like `specorbit list`
- **THEN** the verb communicates the action clearly
- **AND** nouns refine scope via flags or arguments (e.g., `--changes`, `--specs`)

#### Scenario: Backward compatibility for noun commands

- **WHEN** users run noun-prefixed commands such as `specorbit spec ...` or `specorbit change ...`
- **THEN** the CLI SHALL continue to support them for at least one release
- **AND** display a deprecation warning that points to verb-first alternatives

#### Scenario: Disambiguation guidance

- **WHEN** item names are ambiguous between changes and specs
- **THEN** `specorbit show` and `specorbit validate` SHALL accept `--type spec|change`
- **AND** the help text SHALL document this clearly
