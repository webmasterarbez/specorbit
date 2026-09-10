# How Commands Work

**The one thing to know: SpecOrbit has two kinds of commands, and they run in two different places.**

- `specorbit ...` commands run in your **terminal**. (Example: `specorbit init`.)
- `/orbit:...` commands run in your **AI assistant's chat**. (Example: `/orbit:propose`.)

If you ever type `/orbit:propose` into your terminal and nothing happens, this page is why. You are talking to the wrong half of SpecOrbit. Slash commands are not terminal commands. They are instructions you give to your AI coding assistant, in the same chat box where you'd normally type "add a login form."

That single distinction is the most common stumbling block for new users, so let's make it crystal clear.

## The two halves

SpecOrbit is one project wearing two hats.

**The CLI (terminal half).** A program named `specorbit` that you install and run from your shell. It sets up your project, lists and validates changes, shows a dashboard, and archives finished work. You type these into iTerm, the VS Code terminal, PowerShell, anywhere you'd run `git` or `npm`.

```bash
specorbit init        # set up SpecOrbit in this project
specorbit list        # see active changes
specorbit view        # open the interactive dashboard
```

**The slash commands (chat half).** Short commands like `/orbit:propose` and `/orbit:apply` that you type into your AI assistant. These tell the AI to follow the SpecOrbit workflow: draft a proposal, write specs, build from the task list, archive when done. You type these into Claude Code, Cursor, Devin Desktop, Copilot, or whichever assistant you use.

```text
/orbit:propose add-dark-mode    (typed in your AI chat)
/orbit:apply                    (typed in your AI chat)
/orbit:archive                  (typed in your AI chat)
```

Here's the mental model in one picture:

```text
        YOUR TERMINAL                         YOUR AI ASSISTANT'S CHAT
   ┌──────────────────────┐               ┌──────────────────────────────┐
   │  $ specorbit init     │   installs    │  /orbit:propose add-dark-mode  │
   │  $ specorbit list     │  ──────────►  │  /orbit:apply                  │
   │  $ specorbit view     │   commands    │  /orbit:archive                │
   └──────────────────────┘    & skills   └──────────────────────────────┘
        run specorbit here                       run /orbit:* here
```

Notice the arrow. Running `specorbit init` in your terminal is what *installs* the slash commands into your AI tool. The terminal half sets up the chat half. After that, day-to-day driving mostly happens in chat.

## "How do I start interactive mode?"

**There is no separate interactive mode to start.** This question comes up a lot, so it deserves a plain answer.

You don't enter a special SpecOrbit mode. You just open your AI coding assistant like you always do, and type a slash command into the chat. The slash command *is* how you "enter" SpecOrbit. Your assistant recognizes it, loads the matching SpecOrbit skill, and starts following the workflow.

So the real instructions are:

1. Open your AI coding assistant (Claude Code, Cursor, Devin Desktop, and so on) in your project.
2. Type `/orbit:propose` in its chat, the same place you type any other request.
3. Watch the autocomplete: if SpecOrbit is installed, you'll see `/orbit:propose`, `/orbit:apply`, and friends appear as you type the slash.

That's it. No mode to toggle, no daemon to launch, no separate window.

One thing that *is* genuinely interactive lives in the terminal: `specorbit view`. It opens a dashboard for browsing your specs and changes. But that's a viewer, not the thing you propose and build with. The building happens through slash commands in chat.

## Why this split exists

It's worth understanding, because it explains why SpecOrbit works with 30+ different AI tools.

The CLI is the **engine**. It knows the rules: what a change folder looks like, which artifacts depend on which, how to merge a delta spec into your source of truth. It's the same everywhere.

The slash commands are the **steering wheel**, and every AI tool has a slightly different one. Claude Code calls them commands. Cursor and Devin Desktop have their own formats. Some tools call them skills. When you run `specorbit init`, SpecOrbit generates the right kind of file for each tool you selected, so the same `/orbit:propose` intent works no matter which assistant you prefer.

The strength of this design: you learn the workflow once and carry it across tools. The tradeoff: the exact syntax of a command can differ slightly between tools, which is the next section.

## Slash command syntax by tool

The intent is identical everywhere. The spelling follows the file your tool loads.

| Your tool's command file | How you type it | Example tools |
|--------------------------|-----------------|---------------|
| `.../commands/orbit/<id>.*` | `/orbit:propose` | Claude Code, Gemini CLI, Crush |
| `.../orbit-<id>.*` | `/orbit-propose` | Cursor, GitHub Copilot (IDE), Devin Desktop, Trae, Oh My Pi |
| `.amazonq/prompts/orbit-<id>.md` | `@orbit-propose` | Amazon Q Developer |
| none — skills only | `/specorbit-propose` | CodeArts, ForgeCode, Hermes, Mistral Vibe, Zed Agent, shared `.agents` |
| none — Kimi Code | `/skill:specorbit-propose` | Kimi Code |
| none — Codex CLI | `$specorbit-propose` | Codex |

Devin is the one tool that spans two rows. Devin Desktop reads
`.devin/workflows/`, so `/orbit-propose` works there; [Devin Local does
not](https://docs.devin.ai/desktop/devin-local), so on that agent use the
`/specorbit-propose` skill instead. The skills SpecOrbit writes to
`.devin/skills/` work on both, which is why they reference each other by skill
name.

Every tool is listed in [How To Invoke](supported-tools.md#how-to-invoke) — that
table is the authoritative one. Two rows are not slash commands at all: Amazon Q
loads its files into a prompt library invoked with `@`, and the last three rows
use the *skill* name, which is not the command id (`/orbit:apply` is the
`specorbit-apply-change` skill).

When in doubt, read the "Getting started" line `specorbit init` printed: it already
uses the form your tools registered. Typing a slash and watching the autocomplete
works too, for the tools that surface slash commands at all.

## How the commands got there: skills and commands

When you run `specorbit init` (or `specorbit update`), SpecOrbit writes small files into your project so your AI tool can find the workflow. Depending on your tool and settings, these are **skills**, **commands**, or both.

- **Skills** live in places like `.claude/skills/specorbit-*/SKILL.md`. They're the emerging cross-tool standard: a folder of instructions your assistant auto-detects.
- **Commands** live in places like `.cursor/commands/orbit-<id>.md` or `.claude/commands/orbit/<id>.md` — the layout is the tool's, and it decides how you type the command. They're the older per-tool slash command files. Codex does not get generated command files; use `.agents/skills/specorbit-*`.

You don't have to care which one your tool uses. You just type the slash command and it works. But knowing these files exist helps when something goes wrong: if your commands vanish, it usually means these files are missing or stale, and `specorbit update` regenerates them.

See [Supported Tools](supported-tools.md) for the exact paths per tool, and [Migration Guide](migration-guide.md) for how skills replaced the older command-only approach.

## Confirming it's installed

Quick checks, fastest first:

1. **Type a slash in your AI chat.** Start typing `/orbit` and watch for autocomplete suggestions. If they appear, you're set. On a skills-only tool (Codex, Kimi Code, CodeArts, ForgeCode, Hermes, Mistral Vibe, Zed Agent, or the shared `.agents` target) `/orbit` never completes even on a healthy install — try the skill name from the table above instead.
2. **Look for the files.** For Claude Code, check that `.claude/skills/` contains `specorbit-*` folders. Other tools use their own directories ([Supported Tools](supported-tools.md) lists them).
3. **Re-run setup.** From your project root, run `specorbit update`. This regenerates the skill and command files for whatever tools you configured.
4. **Restart your assistant.** Many tools scan for skills and commands at startup, so a fresh window can be the missing step.

## Which commands do I even have?

By default, SpecOrbit installs the **core** set of slash commands:

- `/orbit:explore`: think through an idea with the AI before committing to a change (great first step when you're unsure)
- `/orbit:propose`: create a change and draft all its planning artifacts in one step
- `/orbit:apply`: build the change by working through its task list
- `/orbit:update`: revise a change's planning artifacts and keep them coherent
- `/orbit:sync`: merge a change's spec updates into your main specs (usually automatic)
- `/orbit:archive`: finish a change and file it away

A good default rhythm: `explore` when you're figuring out what to do, then `propose`, `apply`, `archive`. The [Explore First](explore.md) guide explains why that opening step pays off.

There's also an **expanded** set for people who want finer control (`/orbit:new`, `/orbit:continue`, `/orbit:ff`, `/orbit:verify`, `/orbit:bulk-archive`, `/orbit:onboard`). You turn it on with `specorbit config profile`, then apply it with `specorbit update`.

New to all of this? `/orbit:onboard` (in the expanded set) walks you through a complete change on your own codebase, narrating each step. It's the friendliest possible introduction.

For what each command does in detail, see [Commands](commands.md). For when to reach for which, see [Workflows](workflows.md).

## A clean first run

Putting it together, here is the whole sequence with each step labeled by where it happens.

```text
TERMINAL   $ npm install -g specorbit@latest
TERMINAL   $ cd your-project
TERMINAL   $ specorbit init
              (installs slash commands into your AI tool)

AI CHAT      /orbit:explore
              (optional: think the idea through with the AI first)

AI CHAT      /orbit:propose add-dark-mode
              (AI drafts proposal, specs, design, tasks)

AI CHAT      /orbit:apply
              (AI builds it, checking off tasks)

AI CHAT      /orbit:archive
              (change is merged into your specs and filed away)
```

Two terminal steps to set up. Then you live in chat. That's the rhythm.

## Related

- [Getting Started](getting-started.md): the full first-change walkthrough
- [Commands](commands.md): every slash command in detail
- [CLI](cli.md): every terminal command in detail
- [Supported Tools](supported-tools.md): per-tool syntax and file locations
- [FAQ](faq.md): more quick answers
- [Troubleshooting](troubleshooting.md): fixes when commands don't show up
