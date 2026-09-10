## MODIFIED Requirements

### Requirement: Skill Generation

The command SHALL generate Agent Skills for selected AI tools.

#### Scenario: Generating skills for a tool

- **WHEN** a tool is selected during initialization
- **THEN** create 9 skill directories under `.<tool>/skills/`:
  - `specorbit-explore/SKILL.md`
  - `specorbit-new-change/SKILL.md`
  - `specorbit-continue-change/SKILL.md`
  - `specorbit-apply-change/SKILL.md`
  - `specorbit-ff-change/SKILL.md`
  - `specorbit-verify-change/SKILL.md`
  - `specorbit-sync-specs/SKILL.md`
  - `specorbit-archive-change/SKILL.md`
  - `specorbit-bulk-archive-change/SKILL.md`
- **AND** each SKILL.md SHALL contain YAML frontmatter with name and description
- **AND** each SKILL.md SHALL contain the skill instructions

#### Scenario: Pre-approving the SpecOrbit CLI in skill frontmatter

- **WHEN** generating a skill's YAML frontmatter
- **THEN** the frontmatter SHALL include an `allowed-tools` field with the value `Bash(specorbit:*)`
- **AND** an agent that honors `allowed-tools` SHALL run `specorbit` commands from the skill without prompting for approval
- **AND** because `allowed-tools` pre-approves rather than restricts, any other tool the skill uses SHALL remain available under the user's existing permission settings
