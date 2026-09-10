<p align="center">
  <a href="https://github.com/specorbit/specorbit">
    <picture>
      <source srcset="assets/specorbit_mark.svg" media="(prefers-color-scheme: dark)">
      <img src="assets/specorbit_mark.svg" alt="SpecOrbit logo" width="120">
    </picture>
  </a>
</p>

<h1 align="center">SpecOrbit</h1>

<p align="center">
  <strong>The agent-agnostic, spec-driven SDLC engine.</strong><br>
  Living specifications in continuous orbit around your codebase —<br>
  any coding agent, any stack, every stage of the lifecycle.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/specorbit"><img alt="npm version" src="https://img.shields.io/npm/v/specorbit?style=flat-square" /></a>
  <img alt="Node" src="https://img.shields.io/badge/node-%E2%89%A520.19-339933?style=flat-square" />
</p>

> **Stop building in a markdown graveyard.**
> Specs you write once and never update are worse than no specs at all.
> SpecOrbit keeps requirements alive: proposals are isolated deltas, and
> archiving merges them back into the canonical spec baseline. Around
> and around — intent, design, build, verify, ship, maintain.

SpecOrbit is an open-source fork of
[OpenSpec](https://github.com/Fission-AI/OpenSpec), extending its
delta-spec engine toward the full AI-native SDLC lifecycle (Plan,
Design, Build, Test, Deploy, Maintain) for every major coding agent —
Claude Code, Cursor, Codex, GitHub Copilot, Roo, Windsurf, and 30+ more.

Our philosophy:

```text
-> fluid not rigid
-> iterative not waterfall
-> easy not complex
-> built for brownfield not just greenfield
-> specs that live, not specs that rot
```

## See it in action

```text
You: /orbit:explore
AI:  What would you like to explore?
You: I want dark mode but I'm not sure how to do it cleanly.
AI:  Let me look at your styling setup...
     Cleanest path here: CSS variables + a small theme context,
     with system-preference detection. No new dependencies. Scope it?
You: Yes, let's do it.

You: /orbit:propose add-dark-mode
AI:  Created specorbit/changes/add-dark-mode/
     + proposal.md -- why we're doing this, what's changing
     + specs/       -- requirements and scenarios
     + design.md    -- technical approach
     + tasks.md     -- implementation checklist
     Ready for implementation!

You: /orbit:apply
AI:  Implementing tasks...
     + 1.1 Add theme context provider
     + 1.2 Create toggle component
     + 2.1 Add CSS variables
     + 2.2 Wire up localStorage
     All tasks complete!

You: /orbit:archive
AI:  Archived to specorbit/changes/archive/2026-01-23-add-dark-mode/
     Specs updated. Ready for the next feature.
```

<details>
<summary><strong>What do the specs actually look like?</strong></summary>

Plain Markdown -- requirements with concrete scenarios, no special syntax to learn. Here's what goes in the `specs/` folder created above:

```markdown
## ADDED Requirements

### Requirement: Theme selection
The app SHALL let users switch between light and dark themes,
defaulting to the system preference.

#### Scenario: User toggles dark mode
- **WHEN** the user clicks the theme toggle
- **THEN** the app switches to dark mode and persists the choice
```

Your AI writes these; you review the plan before any code is written.

SpecOrbit is built with SpecOrbit -- browse this repo's live [specs](specorbit/specs) and in-flight [changes](specorbit/changes) for real examples at scale.

</details>

## Why teams adopt SpecOrbit

Solo, SpecOrbit keeps you and your AI honest on a single repo. On a team, the hard part moves: a feature spans the API server, the web app, and a shared library; requirements are owned by one team and consumed by others; planning starts before any code exists.

**[Stores](docs/stores-beta/user-guide.md)** are the answer -- planning in a repo of its own. The same `specorbit/` shape you already know (specs and changes), shared by `git push` like anything else. One source of truth your whole team and every coding agent can read, across every repo.

- **Cross-repo features** -- one change, one plan, even when the code lands in three repos.
- **Shared requirements** -- a platform team owns the specs; product teams reference them read-only, right where their coding agent can read them. No drifting wiki.
- **Plan before code** -- capture the plan in the store now; the code repos catch up later.

## The lifecycle loop

SpecOrbit inherits OpenSpec's proven core -- propose, apply, archive --
and extends it around the full AI-native SDLC loop:

```text
        +--------------------------------------------+
        |                                            |
        v                                            |
  [ Plan ]  intent & exploration                     |
        |                                            |
        v                                            |
  [ Design ]  proposal + delta specs + design        |
        |                                            |
        v                                            |
  [ Build ]   tasks + implementation                 |
        |                                            |
        v                                            |
  [ Test ]    verification against scenarios          |
        |                                            |
        v                                            |
  [ Ship ]    archive: deltas merge into specs/      |
        |                                            |
        v                                            |
  [ Maintain ] specs stay in sync with code ----------+
```

Today the Plan/Design/Build/Verify/Archive loop is fully supported; the
deploy gates and telemetry-band stages from the
[AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
are on the [roadmap](specorbit/changes) -- tracked as changes in this
very repository, planned the SpecOrbit way.

## Quick Start

**Requires Node.js 20.19.0 or higher.**

Install SpecOrbit globally:

```bash
npm install -g specorbit@latest
```

Then navigate to your project directory and initialize:

```bash
cd your-project
specorbit init
```

> **Want your AI to do it?** Paste the [setup prompt](docs/installation.md#install-with-your-ai-assistant) into your coding assistant -- it installs the CLI, runs `specorbit init`, and verifies the result.

Now talk to your AI:

- **Not sure what to build yet?** Start with `/orbit:explore`, a no-stakes thinking partner that reads your code, weighs options, and shapes a plan before anything is written. ([Explore guide](docs/explore.md))
- **Already know what you want?** Go straight to `/orbit:propose <what-you-want-to-build>`.

`/orbit:propose` is the canonical name; your tool may spell it `/orbit-propose` (Cursor, GitHub Copilot), `@orbit-propose` (Amazon Q) or `$specorbit-propose` (Codex). `specorbit init` prints the right form for the tools you picked -- see [How To Invoke](docs/supported-tools.md#how-to-invoke).

> [!NOTE]
> Not sure if your tool is supported? [View the full list](docs/supported-tools.md) -- we support 30+ tools and growing.
>
> Also works with pnpm, yarn, bun, and nix. [See installation options](docs/installation.md).

## Docs

**Start here:** the **[Documentation Home](docs/README.md)** maps everything. New to SpecOrbit? Read [Getting Started](docs/getting-started.md), then [How Commands Work](docs/how-commands-work.md) (where you actually type `/orbit:propose`).

-> **[Getting Started](docs/getting-started.md)**: first steps<br>
-> **[Explore First](docs/explore.md)**: think it through with `/orbit:explore` before you commit<br>
-> **[How Commands Work](docs/how-commands-work.md)**: where slash commands run vs the CLI<br>
-> **[Core Concepts at a Glance](docs/overview.md)**: the whole mental model, one page<br>
-> **[Examples & Recipes](docs/examples.md)**: real changes, start to finish<br>
-> **[Workflows](docs/workflows.md)**: combos and patterns<br>
-> **[Existing Projects](docs/existing-projects.md)**: adopt SpecOrbit on a brownfield codebase<br>
-> **[Editing a Change](docs/editing-changes.md)**: update artifacts, go back, reconcile manual edits<br>
-> **[Commands](docs/commands.md)**: slash commands & skills<br>
-> **[CLI](docs/cli.md)**: terminal reference<br>
-> **[Stores](docs/stores-beta/user-guide.md)**: plan in a separate repo, shared across your team (beta)<br>
-> **[Supported Tools](docs/supported-tools.md)**: tool integrations & install paths<br>
-> **[Concepts](docs/concepts.md)**: how it all fits<br>
-> **[Multi-Language](docs/multi-language.md)**: multi-language support<br>
-> **[Customization](docs/customization.md)**: make it yours<br>
-> **[FAQ](docs/faq.md)** | **[Troubleshooting](docs/troubleshooting.md)** | **[Glossary](docs/glossary.md)**: quick help

## Why SpecOrbit?

AI coding assistants are powerful but unpredictable when requirements live only in chat history. SpecOrbit adds a lightweight spec layer so you agree on what to build before any code is written.

- **Agree before you build** -- human and AI align on specs before code gets written
- **Stay organized** -- each change gets its own folder with proposal, specs, design, and tasks
- **Work fluidly** -- update any artifact anytime, no rigid phase gates
- **Use your tools** -- works with 30+ AI assistants via slash commands
- **Specs that stay true** -- archiving merges approved deltas into the living baseline, so documentation never drifts from code

### How we compare

**vs. [Spec Kit](https://github.com/github/spec-kit)** (GitHub) -- Thorough but heavyweight. Rigid phase gates, lots of Markdown, Python setup. SpecOrbit is lighter and lets you iterate freely.

**vs. [Kiro](https://kiro.dev)** (AWS) -- Powerful but you're locked into their IDE and limited to Claude models. SpecOrbit works with the tools you already use.

**vs. nothing** -- AI coding without specs means vague prompts and unpredictable results. SpecOrbit brings predictability without the ceremony.

## Updating SpecOrbit

**Upgrade the package**

```bash
npm install -g specorbit@latest
```

**Refresh agent instructions**

Run this inside each project to regenerate AI guidance and ensure the latest slash commands are active:

```bash
specorbit update
```

## Usage Notes

**Model selection**: SpecOrbit works best with high-reasoning models for both planning and implementation.

**Context hygiene**: SpecOrbit benefits from a clean context window. Clear your context before starting implementation and maintain good context hygiene throughout your session.

## Contributing

Open an issue before you open a PR, and link it from the PR. New features, significant refactors, and architectural changes need a SpecOrbit change proposal first.

-> **[CONTRIBUTING.md](CONTRIBUTING.md)**: the full process, from first issue to merged PR

## Attribution

SpecOrbit is a fork of [OpenSpec](https://github.com/Fission-AI/OpenSpec)
by [Fission-AI](https://github.com/Fission-AI), published here under the same
MIT license with gratitude for the original engineering and community. The
upstream CHANGELOG is preserved in [CHANGELOG.md](CHANGELOG.md).

## Other

<details>
<summary><strong>Telemetry</strong></summary>

SpecOrbit collects anonymous usage stats.

We collect only command names and version to understand usage patterns. No arguments, paths, content, or PII. Automatically disabled in CI.

**Opt-out (any one is enough):**
- `specorbit config set telemetry.enabled false` (global config; unset means on)
- `export SPECORBIT_TELEMETRY=0` or `export DO_NOT_TRACK=1` (env overrides config)

</details>

## License

MIT
