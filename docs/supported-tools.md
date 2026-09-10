# Supported Tools

SpecOrbit works with many AI coding assistants. When you run `specorbit init`, SpecOrbit configures selected tools using your active profile/workflow selection and delivery mode.

## How It Works

For each selected tool, SpecOrbit can install:

1. **Skills** (if delivery includes skills): `.../skills/specorbit-*/SKILL.md`
2. **Commands** (if delivery includes commands): tool-specific `orbit-*` command files

Codex is skills-only: SpecOrbit installs `.agents/skills/specorbit-*/SKILL.md` for Codex even when delivery is set to `commands`, and it does not generate Codex custom prompt files. Existing SpecOrbit-managed skills under the legacy `.codex/skills` path are reconciled after their replacements are written; custom and divergent files are preserved.

By default, SpecOrbit uses the `core` profile, which includes:
- `propose`
- `explore`
- `apply`
- `update`
- `sync`
- `archive`

You can enable expanded workflows (`new`, `continue`, `ff`, `verify`, `bulk-archive`, `onboard`) via `specorbit config profile`, then run `specorbit update`.

## How To Invoke

These docs use `/orbit:propose` as the canonical name, but each tool spells it the
way it loads the file SpecOrbit wrote. Find your tool's command path in the
[Tool Directory Reference](#tool-directory-reference) below, then match its shape here.

| Command file SpecOrbit writes | You type | Tools |
|------------------------------|----------|-------|
| `.../commands/orbit/<id>.*` — an `orbit/` folder namespaces it | `/orbit:<id>` | Claude Code, CodeBuddy, Crush, Gemini CLI, Lingma, Qoder, ZCode |
| `.../orbit-<id>.*` — the filename is the command | `/orbit-<id>` | Every other tool with generated command files, except Amazon Q and Devin |
| `.devin/workflows/orbit-<id>.md` — read by only one of Devin's two agents | `/orbit-<id>` on Devin Desktop, `/specorbit-<skill>` on Devin Local | Devin Desktop\*\*\*\* |
| `.amazonq/prompts/orbit-<id>.md` — a prompt, not a command | `@orbit-<id>` | Amazon Q Developer |
| none — skills only | `/specorbit-<skill>` | CodeArts, ForgeCode, Hermes, MiniMax Code, Mistral Vibe, Zed Agent, shared `.agents` |
| none — Kimi Code | `/skill:specorbit-<skill>` | Kimi Code |
| none — Codex CLI | `$specorbit-<skill>` | Codex ([`/specorbit-<skill>` is not recognized](https://github.com/openai/codex/issues/11817)) |

So `/orbit:propose` is `/orbit-propose` in Cursor, `@orbit-propose` in Amazon Q, and
`$specorbit-propose` in Codex.

Two things vary independently, which is why the rows do not collapse:

- **The name.** Rows 1–2 differ only in how the file names the command, and the
  `orbit-<id>` / `orbit:<id>` stem is the same for every tool with generated
  command files.
- **The wrapper.** Amazon Q loads its files into a prompt library invoked with
  `@`. Skills-only tools generate no command files at all, so their last three
  rows use *skill* names — listed under
  [Generated Skill Names](#generated-skill-names) — which do not map one-to-one
  onto command ids (`/orbit:apply` is the `specorbit-apply-change` skill).

The command path patterns above are extension-neutral (`.*`) on purpose: the
extension is the tool's (`.toml` for Gemini CLI, `.prompt` for Continue,
`.prompt.md` for Kiro and GitHub Copilot), and a few tools show the name with
its extension in the picker. Match the directory shape, not the extension.

The files SpecOrbit generates, and the "Getting started" hint printed after setup,
already use the right form for the tools you selected — so the fastest answer is
to read the hint.

## Tool Directory Reference

| Tool (ID) | Skills path pattern | Command path pattern |
|-----------|---------------------|----------------------|
| Amazon Q Developer (`amazon-q`) | `.amazonq/skills/specorbit-*/SKILL.md` | `.amazonq/prompts/orbit-<id>.md` |
| Antigravity (`antigravity`) | `.agent/skills/specorbit-*/SKILL.md` | `.agent/workflows/orbit-<id>.md` |
| Auggie (`auggie`) | `.augment/skills/specorbit-*/SKILL.md` | `.augment/commands/orbit-<id>.md` |
| IBM Bob Shell (`bob`) | `.bob/skills/specorbit-*/SKILL.md` | `.bob/commands/orbit-<id>.md` |
| Claude Code (`claude`) | `.claude/skills/specorbit-*/SKILL.md` | `.claude/commands/orbit/<id>.md` |
| Cline (`cline`) | `.cline/skills/specorbit-*/SKILL.md` | `.clinerules/workflows/orbit-<id>.md` |
| Command Code (`command-code`) | `.commandcode/skills/specorbit-*/SKILL.md` | `.commandcode/commands/orbit-<id>.md` |
| CodeArts (`codeartsagent`) | `.codeartsdoer/skills/specorbit-*/SKILL.md` | Not generated (no command adapter; use skill-based `/specorbit-*` invocations) |
| CodeBuddy (`codebuddy`) | `.codebuddy/skills/specorbit-*/SKILL.md` | `.codebuddy/commands/orbit/<id>.md` |
| Codex (`codex`) | `.agents/skills/specorbit-*/SKILL.md` | Not generated (skills-only; use `$specorbit-*`) |
| Devin Desktop, formerly Windsurf (`devin`) | `.devin/skills/specorbit-*/SKILL.md` | `.devin/workflows/orbit-<id>.md`\*\*\*\* |
| ForgeCode (`forgecode`) | `.forge/skills/specorbit-*/SKILL.md` | Not generated (no command adapter; use skill-based `/specorbit-*` invocations) |
| Continue (`continue`) | `.continue/skills/specorbit-*/SKILL.md` | `.continue/prompts/orbit-<id>.prompt` |
| CoStrict (`costrict`) | `.cospec/skills/specorbit-*/SKILL.md` | `.cospec/specorbit/commands/orbit-<id>.md` |
| Crush (`crush`) | `.crush/skills/specorbit-*/SKILL.md` | `.crush/commands/orbit/<id>.md` |
| Cursor (`cursor`) | `.cursor/skills/specorbit-*/SKILL.md` | `.cursor/commands/orbit-<id>.md` |
| Factory Droid (`factory`) | `.factory/skills/specorbit-*/SKILL.md` | `.factory/commands/orbit-<id>.md` |
| Gemini CLI (`gemini`) | `.gemini/skills/specorbit-*/SKILL.md` | `.gemini/commands/orbit/<id>.toml` |
| GitHub Copilot (`github-copilot`) | `.github/skills/specorbit-*/SKILL.md` | `.github/prompts/orbit-<id>.prompt.md`\*\* |
| Hermes Agent (`hermes`) | `.hermes/skills/specorbit-*/SKILL.md`\*\*\* | Not generated (no command adapter; use skill-based `/specorbit-*` invocations) |
| iFlow (`iflow`) | `.iflow/skills/specorbit-*/SKILL.md` | `.iflow/commands/orbit-<id>.md` |
| Junie (`junie`) | `.junie/skills/specorbit-*/SKILL.md` | `.junie/commands/orbit-<id>.md` |
| Kilo Code (`kilocode`) | `.kilocode/skills/specorbit-*/SKILL.md` | `.kilocode/workflows/orbit-<id>.md` |
| Kimi Code (`kimi`) | `.kimi-code/skills/specorbit-*/SKILL.md` | Not generated (no command adapter; use skill-based `/skill:specorbit-*` invocations) |
| Kiro (`kiro`) | `.kiro/skills/specorbit-*/SKILL.md` | `.kiro/prompts/orbit-<id>.prompt.md` |
| Lingma (`lingma`) | `.lingma/skills/specorbit-*/SKILL.md` | `.lingma/commands/orbit/<id>.md` |
| MiniMax Code (`minimax-code`) | `~/.minimax/skills/specorbit-*/SKILL.md` | Not generated (no command adapter; use MiniMax Code skills) |
| Mistral Vibe (`vibe`) | `.vibe/skills/specorbit-*/SKILL.md` | Not generated (no command adapter; use skill-based `/specorbit-*` invocations) |
| Oh My Pi (`oh-my-pi`) | `.omp/skills/specorbit-*/SKILL.md` | `.omp/commands/orbit-<id>.md` |
| OpenCode (`opencode`) | `.opencode/skills/specorbit-*/SKILL.md` | `.opencode/commands/orbit-<id>.md` |
| Pi (`pi`) | `.pi/skills/specorbit-*/SKILL.md` | `.pi/prompts/orbit-<id>.md` |
| SourceCraft Code Assistant for VS Code (`codeassistant`) | `.codeassistant/skills/specorbit-*/SKILL.md` | `.codeassistant/commands/orbit-<id>.md` |
| Qoder (`qoder`) | `.qoder/skills/specorbit-*/SKILL.md` | `.qoder/commands/orbit/<id>.md` |
| Qwen Code (`qwen`) | `.qwen/skills/specorbit-*/SKILL.md` | `.qwen/commands/orbit-<id>.md` |
| [Rovo Dev CLI](https://support.atlassian.com/rovo/docs/use-rovo-dev-cli/) (`rovodev`) | `.rovodev/skills/specorbit-*/SKILL.md` | Not generated. Rovo has no slash-command surface — it matches skills automatically or by prompt (e.g. "use the specorbit-propose skill"); `/skills` only manages them. Generated content references skills by name, never as `/specorbit-*` commands. |
| [Zoo Code](https://github.com/Zoo-Code-Org/Zoo-Code) (`roocode`) | `.roo/skills/specorbit-*/SKILL.md` | `.roo/commands/orbit-<id>.md` |
| Trae (`trae`) | `.trae/skills/specorbit-*/SKILL.md` | `.trae/commands/orbit-<id>.md` |
| [Zed Agent](https://zed.dev/docs/ai/skills) (`zed`) | `.agents/skills/specorbit-*/SKILL.md` | Not generated (skills-only; use `/specorbit-*` or `@specorbit-*`) |
| ZCode (`zcode`) | `.zcode/skills/specorbit-*/SKILL.md` | `.zcode/commands/orbit/<id>.md` |
| Shared `.agents` skills (`agents`) | `.agents/skills/specorbit-*/SKILL.md` | Not generated (no command adapter; use skill-based `/specorbit-*` invocations) |

\*\* GitHub Copilot prompt files are recognized as custom slash commands in IDE extensions (VS Code, JetBrains, Visual Studio). Copilot CLI does not currently consume `.github/prompts/*.prompt.md` directly. Selecting `github-copilot` can also set up the GitHub-hosted **cloud coding agent** — see [GitHub Copilot cloud coding agent](#github-copilot-cloud-coding-agent) below.

\*\*\* Hermes loads skills from `~/.hermes/skills/` by default. To use project-local SpecOrbit skills, add the project `.hermes/skills/` directory to `skills.external_dirs` in `~/.hermes/config.yaml`; Hermes then exposes skills with user-facing slash invocations such as `/specorbit-propose`.

\*\*\*\* Windsurf was [rebranded to Devin Desktop](https://docs.devin.ai/desktop/devin-desktop-faq) on June 2, 2026, and its config directory moved: `.devin/` is the preferred read + write location, `.windsurf/` a legacy read-only fallback. SpecOrbit follows the rename — the tool id is `devin`, and `--tools windsurf` still resolves to it so existing setup scripts keep working. A project still holding SpecOrbit files in `.windsurf/` is offered the move on the next `specorbit update`; declining leaves them in place, and files you wrote yourself are never touched. Workflows are invoked by filename, so `.devin/workflows/orbit-apply.md` is `/orbit-apply`. The [Devin Local agent does not support workflows](https://docs.devin.ai/desktop/devin-local) — only skills, and it does not read `.windsurf/` at all — so whenever SpecOrbit writes Devin skills it keeps their bodies, and the getting-started hint, on `/specorbit-*` skill invocations, which work on both agents. Under commands-only delivery no skills are written and both fall back to `/orbit-*`.

SourceCraft Code Assistant support targets its VS Code extension. Its [custom commands](https://sourcecraft.dev/portal/docs/en/code-assistant/operations/agent/slash-commands) and [skills](https://sourcecraft.dev/portal/docs/ru/code-assistant/operations/agent/skills) are available only in VS Code. This integration does not configure SourceCraft web or JetBrains.

With skills-only delivery, ask Code Assistant to use the `specorbit-propose` skill with your idea. Skills activate through request matching; SpecOrbit does not generate `/specorbit-*` commands for this tool.

MiniMax Code is a global skills-only integration. SpecOrbit writes only its
`specorbit-*` directories under `~/.minimax/skills/`; it does not create
repo-local `.minimax` or `.mavis` directories. Commands-only delivery leaves
existing global MiniMax Code skills untouched so one project's delivery setting
cannot remove skills used by another project.

### GitHub Copilot cloud coding agent

GitHub's [Copilot coding agent](https://docs.github.com/en/copilot/using-github-copilot/coding-agent) runs on GitHub in a GitHub Actions environment — separate from Copilot in your editor. SpecOrbit can set it up to use the SpecOrbit CLI by generating two files:

- `.github/workflows/copilot-setup-steps.yml` — installs `specorbit` in the agent's environment
- `.github/agents/specorbit.agent.md` — tells the agent how to drive SpecOrbit

Because this writes a GitHub Actions workflow into your repository, it is **opt-in**:

| How | Behavior |
|-----|----------|
| `specorbit init` (interactive) | Asks whether to set up cloud files. Default is **No**. |
| `specorbit init --copilot-cloud` | Sets them up without prompting (for scripts/CI). |
| `specorbit init --no-copilot-cloud` | Skips them without prompting, and removes any previously generated ones. |
| `specorbit update` | Never prompts. Refreshes the files only if you opted in (or the project already has them). If you opted out, it removes SpecOrbit-managed cloud files. |

Your choice is saved in `specorbit/config.yaml` as `githubCopilot.cloudAgent: true|false`, so non-interactive updates honor it. SpecOrbit only ever writes or removes files whose content it generated — if you customize `copilot-setup-steps.yml` or `specorbit.agent.md`, or already have your own, it is left untouched (and `init`/`update` tell you so).

### When to pick the shared `.agents` target

`agents` is the vendor-neutral option: it writes skills to `.agents/skills/`, the
shared root many agent tools read, instead of a tool-specific directory.

| Situation | Pick |
|-----------|------|
| Your tool has its own row above | Its own ID — you get that tool's integration, including slash commands where it supports them |
| Several agents on one repo, all reading `.agents/skills` | `agents` — one skill tree instead of one per tool |
| Your tool isn't listed yet but reads `.agents/skills` | `agents` |

Selecting it alongside a tool-specific ID is fine; each normally writes to its
own root. Codex and Zed Agent are the exceptions because they use the same canonical
`.agents` root. If Codex is selected with Zed or `agents`, SpecOrbit keeps one
Codex-led tree. Its handoffs name both `$specorbit-*` for Codex and
`/specorbit-*` for other agents, so `--tools all` and existing multi-agent
setups keep working without two writers overwriting the same files.
SpecOrbit also offers it automatically once a project has a `.agents/skills/`
directory — a bare `.agents/` is not enough, since tools use that root for rules
and subagent definitions too. Note `.agents` is not `.agent`: the singular
directory belongs to Antigravity.

Two things to know:

- **Skills only.** No command adapter exists, so no `orbit-*` command files are
  written; with a commands-inclusive delivery mode `specorbit init` lists `agents`
  among the tools it reports under `Commands skipped for: … (no adapter)`.
  Invoke the workflows by skill name —
  most assistants that read `.agents/skills` spell that `/specorbit-propose`, the form
  SpecOrbit's setup hint prints. The target is vendor-neutral, so check your
  assistant's own docs if it uses another form.
- **No `AGENTS.md` is created or edited.** The target is the `.agents/` directory.
  If your root `AGENTS.md` still carries SpecOrbit marker blocks from an older
  version, `specorbit update` strips them — see the [Migration Guide](migration-guide.md).

Zed support here is for the built-in Zed Agent. Zed External Agents and Terminal
Threads use their own integrations. Agent Skills require
[Zed v1.4.2](https://github.com/zed-industries/zed/releases/tag/v1.4.2) or newer.
Project-local skills are unavailable in an untrusted worktree until you
[grant trust](https://zed.dev/docs/worktree-trust).

Because `.agents/skills/` is shared by Codex, Zed Agent, and the vendor-neutral target,
it is worth knowing what SpecOrbit claims there:
it writes, refreshes, and removes only the `specorbit-*` skill directories for your
selected workflows, plus an `.specorbit-target` marker that records whether Codex,
Zed Agent, or the vendor-neutral target rendered that shared tree. Anything else in that
directory is left alone. Treat the `specorbit-*` names and marker as SpecOrbit's —
edits inside them are replaced on the next `specorbit update`, the same as for
every other tool.

For pre-marker projects, SpecOrbit infers ownership from managed skill references:
`$specorbit-*` means Codex and `/specorbit-*` means the vendor-neutral target. A
generic canonical tree alongside legacy `.codex/skills` is treated as an older
dual-target install and consolidated into the compatible shared tree.

`specorbit update` honors this ownership too. If a project owns `.agents` as the
vendor-neutral target and a leftover Codex install is detected only from stray
prompt files, the update leaves the established `agents` tree in place instead of
rewriting it with Codex syntax, and preserves those legacy prompt files rather
than deleting them. To hand the shared tree to Codex, run `specorbit init --tools
codex` explicitly.

## Non-Interactive Setup

For CI/CD or scripted setup, use `--tools` (and optionally `--profile`):

```bash
# Configure specific tools
specorbit init --tools claude,cursor

# Configure all supported tools
specorbit init --tools all

# Skip tool configuration
specorbit init --tools none

# Override profile for this init run
specorbit init --profile core
```

**Available tool IDs (`--tools`)** — `windsurf` is also accepted, as an alias for `devin`: `amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `command-code`, `codeartsagent`, `codex`, `devin`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `hermes`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `minimax-code`, `vibe`, `oh-my-pi`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `codeassistant`, `trae`, `zed`, `zcode`, `agents`

## Workflow-Dependent Installation

SpecOrbit installs workflow artifacts based on selected workflows:

- **Core profile (default):** `propose`, `explore`, `apply`, `update`, `sync`, `archive`
- **Custom selection:** any subset of all workflow IDs:
  `propose`, `explore`, `new`, `continue`, `apply`, `update`, `ff`, `sync`, `archive`, `bulk-archive`, `verify`, `onboard`

In other words, skill/command counts are profile-dependent and delivery-dependent, not fixed.

## Generated Skill Names

When selected by profile/workflow config, SpecOrbit generates these skills:

- `specorbit-propose`
- `specorbit-explore`
- `specorbit-new-change`
- `specorbit-continue-change`
- `specorbit-apply-change`
- `specorbit-update-change`
- `specorbit-ff-change`
- `specorbit-sync-specs`
- `specorbit-archive-change`
- `specorbit-bulk-archive-change`
- `specorbit-verify-change`
- `specorbit-onboard`

See [Commands](commands.md) for command behavior and [CLI](cli.md) for `init`/`update` options.

## Related

- [CLI Reference](cli.md) — Terminal commands
- [Commands](commands.md) — Slash commands and skills
- [Getting Started](getting-started.md) — First-time setup
