# Examples & Recipes

Real changes, start to finish. Each recipe shows the commands you'd type and what you'd see back, so you can match your situation to a pattern and copy it. These use the default **core** commands (`propose`, `explore`, `apply`, `update`, `sync`, `archive`); where the expanded set helps, it's noted.

A reminder before you start: slash commands like `/orbit:propose` go in your **AI assistant's chat**, and `specorbit` commands go in your **terminal**. If that's new, read [How Commands Work](how-commands-work.md) first. In the transcripts below, `You:` and `AI:` are the chat, and lines starting with `$` are the terminal.

> **Not sure what you're building yet?** Most of these recipes are sharper if you start with `/orbit:explore` to think it through first. [Recipe 3](#recipe-3-exploring-before-you-commit) shows it in action, and the [Explore First](explore.md) guide makes the full case.

## Recipe 1: A small feature, the fast path

**When to use it:** you know what you want, and it's a contained piece of work. This is the most common recipe.

The whole thing is three commands. Propose, build, archive.

```text
You: /orbit:propose add-logout-button

AI:  Created specorbit/changes/add-logout-button/
     ✓ proposal.md — why and what
     ✓ specs/      — the new requirement and its scenarios
     ✓ design.md   — technical approach
     ✓ tasks.md    — implementation checklist
     Ready for implementation. Run /orbit:apply.
```

Now read the plan. Open the proposal and the delta spec. This is the moment SpecOrbit is built for: catching a wrong assumption while it's still one paragraph, not 400 lines of code. Edit any artifact directly if something's off, then continue.

```text
You: /orbit:apply

AI:  Working through tasks...
     ✓ 1.1 Add logout button to header
     ✓ 1.2 Clear session on click
     ✓ 1.3 Add confirmation dialog
     All tasks complete!

You: /orbit:archive

AI:  Archiving add-logout-button...
     ✓ Merged specs into specorbit/specs/auth/spec.md
     ✓ Moved to specorbit/changes/archive/2026-06-22-add-logout-button/
     Done. Ready for the next change.
```

That's it. The logout behavior is now part of your specs, and the change is filed away with its full context.

## Recipe 2: A bug fix

**When to use it:** something is broken and you want the fix recorded as a deliberate change to behavior, not a mystery commit.

Bug fixes work exactly like features. The difference is in how you frame the proposal: describe the *correct* behavior, not just "fix the bug."

```text
You: /orbit:propose fix-login-redirect-loop

AI:  Created specorbit/changes/fix-login-redirect-loop/
     The proposal captures the current broken behavior and the
     intended behavior. The delta spec MODIFIES the redirect
     requirement so it's now precise and testable.
     Ready for implementation.
```

Because the fix lands as a `MODIFIED` requirement with a fresh scenario, the next person (or the next AI session) sees not just that you fixed it, but what "correct" means. Then `/orbit:apply` and `/orbit:archive` as usual.

Tip: for a fix, a good scenario is the regression test in prose. "GIVEN a logged-out user, WHEN they submit valid credentials, THEN they land on the dashboard and are not redirected again." Write that, and the implementation has a clear target.

## Recipe 3: Exploring before you commit

**When to use it:** you have a problem but not yet a plan. You're not sure what to build, or which approach is right.

Start with `/orbit:explore`. It's a thinking partner with no structure and no artifacts created. It reads your codebase and helps you decide.

```text
You: /orbit:explore

AI:  What would you like to explore?

You: Page loads feel slow but I don't know where the time goes.

AI:  Let me look... I found three likely culprits:
     1. Large unoptimized images on the product list
     2. Synchronous data fetching that blocks render
     3. Re-renders triggered by context changes
     Which should we tackle first?

You: The data fetching one.

You: /orbit:propose optimize-product-list-fetching

AI:  Created the change, with a proposal informed by what we just
     found. Ready for implementation.
```

Exploration clarifies your thinking *before* you spend a change on it. When the insight crystallizes, propose, and the AI carries the context forward.

## Recipe 4: Juggling two changes at once

**When to use it:** you're mid-feature and an urgent fix jumps the queue.

Changes are independent folders, so parallel work doesn't conflict. Start the fix, ship it, then return to the feature right where you left off.

```text
You: I'm partway through add-dark-mode, but I need to fix a login bug now.

You: /orbit:propose fix-login-redirect

AI:  Created specorbit/changes/fix-login-redirect/. Ready for implementation.

You: /orbit:apply

AI:  Implemented the fix. All tasks complete.

You: /orbit:archive

AI:  ✓ Archived fix-login-redirect.

You: Back to dark mode.

You: /orbit:apply add-dark-mode

AI:  Resuming add-dark-mode. Picking up at task 2.3: Update Header...
```

Naming the change in `/orbit:apply add-dark-mode` is how you point the AI at a specific change when more than one is active. Because tasks track completion in `tasks.md`, the AI knows exactly where you stopped.

When several changes are done at once, the expanded `/orbit:bulk-archive` files them together and resolves spec conflicts by checking what's actually implemented. See [Workflows](workflows.md#parallel-changes).

## Recipe 5: A refactor with no behavior change

**When to use it:** you're restructuring code, and externally visible behavior should stay identical.

This is the interesting case, because a pure refactor has *nothing to add to your specs*. The behavior contract doesn't change; only the implementation does. So the work lives in the design and tasks, and the spec delta is empty or absent.

```text
You: /orbit:propose refactor-payment-module

AI:  Created the change. The proposal states the goal (split the
     payment module, no behavior change) and the design captures
     the new structure. No spec changes, since behavior is identical.
     Ready for implementation.
```

Declare the empty delta explicitly by setting `skip_specs: true` in the change's `.specorbit.yaml`:

```yaml
schema: spec-driven
skip_specs: true
```

Without the marker, `specorbit validate` rejects a change with zero deltas (so a forgotten specs phase still gets caught); with it, validation passes and `specorbit status` shows the specs stage as explicitly skipped rather than pending. If the refactor turns out to change behavior after all, remove `skip_specs` from `.specorbit.yaml` and write the delta specs — validate treats the marker plus spec files as a conflict, so the stale marker can't linger silently.

Archiving a marked change needs no extra flags (there are no deltas to merge). Independently, the `--skip-specs` flag tells the terminal command to skip the spec step explicitly:

```bash
$ specorbit archive refactor-payment-module --skip-specs
```

The same flag is handy for tooling, CI, and docs-only changes. The principle: specs describe behavior, so if behavior didn't change, the spec shouldn't either. See [Concepts](concepts.md#what-a-spec-is-and-is-not).

## Recipe 6: Step-by-step control (expanded commands)

**When to use it:** a complex or risky change where you want to review each artifact before moving on.

The core `/orbit:propose` drafts everything at once. When you'd rather go one step at a time, turn on the expanded commands:

```bash
$ specorbit config profile      # select the expanded workflows
$ specorbit update              # apply them to this project
```

Now you can scaffold and build incrementally:

```text
You: /orbit:new add-2fa

AI:  Created specorbit/changes/add-2fa/. Ready to create: proposal.

You: /orbit:continue

AI:  Created proposal.md. Now available: specs, design.

You: /orbit:continue

AI:  Created specs/auth/spec.md. Now available: design.
```

Review each artifact as it lands, edit freely, and continue when you're happy. When you want the rest drafted in one go, `/orbit:ff` fast-forwards through the remaining planning artifacts. Before archiving, `/orbit:verify` checks that the implementation actually matches the specs. See [Workflows](workflows.md#orbitff-vs-orbitcontinue).

## Recipe 7: Learning the whole loop hands-on

**When to use it:** you've installed SpecOrbit and want to *feel* the workflow on your own code, not a toy example.

Turn on the expanded commands (see Recipe 6), then:

```text
You: /orbit:onboard

AI:  Welcome to SpecOrbit! I'll walk you through a complete change
     using your actual codebase. Let me scan for a small, safe
     improvement we can make together...
```

`/orbit:onboard` finds a real (small) improvement, creates a change for it, implements it, and archives it, narrating every step. It takes 15 to 30 minutes and leaves you with a real change you can keep or discard. It's the gentlest way to learn. See [Commands](commands.md#orbitonboard).

## Checking your work from the terminal

Any time, from your terminal, you can inspect the state of things:

```bash
$ specorbit list                      # active changes
$ specorbit show add-dark-mode        # one change in detail
$ specorbit validate add-dark-mode    # check structure
$ specorbit view                      # interactive dashboard
```

These are read-and-inspect tools. The proposing and building still happen through slash commands in chat. Full details in the [CLI reference](cli.md).

## Where to go next

- [Explore First](explore.md): the recommended way to start when you're unsure
- [Workflows](workflows.md): the patterns above, with decision guidance on when to use each
- [Commands](commands.md): every slash command in detail
- [Getting Started](getting-started.md): the canonical first-change walkthrough
- [Concepts](concepts.md): why the pieces fit together the way they do
