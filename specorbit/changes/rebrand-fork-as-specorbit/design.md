## Context

The repository is a fresh clone of Fission-AI/OpenSpec (main, ~9d4e597) being rebranded as the independent fork SpecOrbit. ~865 files reference "specorbit" and ~187 reference "orbit". There is zero installed base for the fork, so renames can be clean breaks with no compatibility shims. Upstream remains available as a cherry-pick source via a git remote. The rename spans four layers: cosmetic (README/docs), plumbing (src constants/strings), on-disk format (project directory, metadata files, global config, env vars), and ecosystem (npm package, slash-command prefix, skills).

The engine's own planning root (`specorbit/` in this repo) contains 40+ capabilities and 24 active changes, and must itself be renamed so the fork dogfoods its own format.

## Goals / Non-Goals

**Goals:**
- Every user-visible and on-disk surface says `specorbit` / `SpecOrbit` / `/orbit:` / `SPECORBIT_*`.
- `pnpm build` and `pnpm test` pass after the sweep.
- `specorbit init` in a sandbox repo scaffolds `specorbit/` and generates `/orbit:`-prefixed commands per tool.
- `npm publish --dry-run` succeeds under the name `specorbit`.
- Upstream attribution is preserved (MIT, fork note).

**Non-Goals:**
- No behavior changes: command semantics, parsers, archive logic, schemas (`spec-driven` name unchanged) are untouched.
- No migration path for existing upstream SpecOrbit projects (no installed base; revisit later if demand appears).
- No website rebuild, no PRD lifecycle features (intent/gates/evals/telemetry bands) — separate changes.
- No reading of legacy `specorbit/` directories or `SPECORBIT_*` env vars (clean break).

## Decisions

**D1 — Brand casing.** `SpecOrbit` in prose, `specorbit` for CLI/package/paths/identifiers, `SPECORBIT_` for env vars and constants. Camel-case echoes SpecOrbit's own style and stays unique in search.

**D2 — Unscoped npm name.** Publish as `specorbit` (not `@specloop/cli`-style scope). `npm view specorbit` is 404; scopes tie the package to an npm org we don't need. Unscoped matches the CLI's install story (`npm install -g specorbit`). Verify with `npm publish --dry-run` before cut-over (typosquat guard).

**D3 — Slash prefix `orbit`, not `specorbit`.** Commands are `/orbit:propose`, filenames `orbit-<id>.md`, namespaces `orbit/`. Shorter, distinctive, and consistent with the `/orbit:` shorthand pattern it replaces. `orbit` -> `orbit` is a 1:1 string mapping everywhere (filenames, namespaces, detection logic in `src/core/command-generation/invocation.ts`, legacy-cleanup patterns), which keeps the sweep mechanical.

**D4 — Sweep as ordered string replacement + git mv, not per-file hand edits.** Replacement map (ordered, case-sensitive):
1. `specorbit` -> `specorbit` (package references, self-update)
2. `SPECORBIT_` -> `SPECORBIT_` (env vars, constants)
3. `SpecOrbit` -> `SpecOrbit` (prose brand)
4. `Specorbit` -> `Specorbit` (sentence-case variants)
5. `specorbit` -> `specorbit` (identifiers, paths, lowercase)
6. `orbit` -> `orbit` (command prefix; applies to `orbit-`, `/orbit:`, `@orbit-`)
Applied per-directory-group (src, test, skills, docs, scripts, planning root) after file/dir renames, because rename-first keeps references intact for `rg`. Directory renames: `bin/specorbit.js` -> `bin/specorbit.js`, `skills/specorbit-*` -> `skills/specorbit-*`, `specorbit/` -> `specorbit/`, `src/core/specorbit-root.ts` -> `src/core/specorbit-root.ts`. Symbol renames follow constants (`SPECORBIT_DIR_NAME` -> `SPECORBIT_DIR_NAME`, `SPECORBIT_ROOT_DIR` -> `SPECORBIT_ROOT_DIR`, etc.).

**D5 — Planning-root content: rename paths, keep history.** `git mv specorbit specorbit` then sweep inside. Archived change documents are historical records; the sweep renames their strings too (cheap, consistent) rather than preserving stale brand strings that would mislead the fork's own tooling when it reads paths. The parked `unify-template-generation-pipeline` change stays as-is.

**D6 — Delete upstream-only surfaces.** `website/`, `docs-lab/`, `README_OLD.md`, `specorbit-parallel-merge-plan.md` are removed. `website/` is not in pnpm-workspace packages; only `.github/workflows/security.yml` references it (scan path updated). Git history preserves everything; the fork's site is a later change. The CHANGELOG is kept with a fork header note — it is the audit trail of 1,800+ upstream PRs and MIT attribution.

**D7 — Parity hashes and generated markers regenerated, not hand-edited.** `scripts/regen-parity-hashes.mjs` and `scripts/generate-skillssh.mjs` exist for exactly this; run them after the sweep instead of guessing (per project rule: if we generate it, we track it by name in a constant).

**D8 — Self-update flow retargets to `specorbit`.** `src/core/version-check.ts` and `src/core/github-copilot/cloud-agent.ts` hardcode `specorbit` install commands; they become `npm install -g specorbit`. The upgrade check compares against the registry package `specorbit`.

## Risks / Trade-offs

- [Missed replacement variants (e.g., `open spec`, `Open Spec`, `fission`] -> grep for residual `specorbit|orbit|SpecOrbit|fission` (case-insensitive) after the sweep; allowlist only intentional attribution mentions (README fork note, CHANGELOG history, archived docs' historical references).
- [Test fixtures encode old paths] -> tests are swept with the same map; Windows-path tests already use `path.join()` so separator changes are not introduced by the sweep.
- [Typosquat/uniqueness rejection on npm publish] -> `npm publish --dry-run` before cut-over; fallback names (`speccycle`, `specgate`) verified free.
- [Upstream cherry-picks get harder] -> accepted: hard fork. `upstream` remote kept; fixes are ported manually by content, not by merge.
- [Dogfood-root rename breaks CLI resolution during the transition] -> order: rename planning root AFTER src constants, in the same working session, then run full build+test; the CLI resolves its own planning root by the `specorbit/` dir name constant.
- [CI badge/workflow URLs point at Fission-AI] -> workflows swept; badges removed or repointed at the new org placeholder; cut-over repo creation (Step 8) finalizes URLs.

## Migration Plan

1. Rename files/dirs (git mv) — D4 order.
2. Sweep string map per directory group.
3. Regenerate parity hashes + generated skills.
4. `pnpm build && pnpm test` — fix fallout until green.
5. Sandbox smoke test: `specorbit init` scaffolds `specorbit/`, prints `/orbit:` spellings.
6. `npm publish --dry-run`.
7. Rollback: `git checkout -- .` + `git clean` restores pre-sweep state at any point before cut-over (everything is one uncommitted working tree until the user commits).

## Open Questions

- Final GitHub org/repo URLs (user creates org in Step 8; package.json homepage/bugs use placeholders until then, e.g. `https://github.com/specorbit/specorbit`).
- Domain: specorbit.dev assumed for README links; adjust if the registrar check fails (fallbacks .io/.app).
