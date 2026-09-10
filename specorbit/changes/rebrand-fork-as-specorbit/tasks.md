## 1. File and directory renames

- [x] 1.1 `git mv bin/specorbit.js bin/specorbit.js`
- [x] 1.2 `git mv src/core/specorbit-root.ts src/core/specorbit-root.ts`
- [x] 1.3 `git mv` each `skills/specorbit-*` directory to `skills/specorbit-*`
- [x] 1.4 `git mv specorbit/ specorbit/` (planning root; keep all content)
- [x] 1.5 Delete `README_OLD.md`, `specorbit-parallel-merge-plan.md`, `website/`, `docs-lab/` via `git rm`
- [x] 1.6 Update `.github/workflows/security.yml` (and any workflow) to drop website/docs-lab scan paths

## 2. Constants and plumbing (src/core)

- [x] 2.1 Rename `SPECORBIT_*` constants to `SPECORBIT_*` in `src/core/config.ts`, `src/core/specorbit-root.ts` (specorbit/ dir, config.yaml paths, specs/changes/archive dirs)
- [x] 2.2 Update `src/core/global-config.ts`: dir name constant `specorbit` -> `specorbit` (config + data dirs, XDG/Windows fallbacks) with `path.join()` throughout
- [x] 2.3 Rename env vars `SPECORBIT_*` -> `SPECORBIT_*` (telemetry, update check, animation, completions, concurrency, allowed tools) across `src/`
- [x] 2.4 Retarget self-update flow in `src/core/version-check.ts` to package `specorbit` (bin path `specorbit`, install command, upgrade confirmation messages)
- [x] 2.5 Retarget `src/core/github-copilot/cloud-agent.ts` prompts to `specorbit` CLI and `npm install -g specorbit`
- [x] 2.6 Update `.specorbit.yaml` change-metadata filename to `.specorbit.yaml` (reader/writer in change creation, status tracking)

## 3. CLI surface

- [x] 3.1 `src/cli/index.ts`: `program.name('specorbit')`, root-name skip check, deprecation strings, help text
- [x] 3.2 Sweep remaining user-facing `specorbit`/`SpecOrbit` strings across `src/commands/`, `src/ui/`, `src/core/` (welcome screen, completion tips, error guidance, templates)
- [x] 3.3 Update `src/core/legacy-cleanup.ts` patterns (`.opencode/command/orbit-*.md`, `specorbit-*.md`) to orbit/specorbit equivalents

## 4. Command generation and skills

- [x] 4.1 Sweep `/orbit:` -> `/orbit:`, `orbit-` -> `orbit-`, `orbit/` -> `orbit/` across `src/core/command-generation/` (adapters, generator, invocation, types) and `src/core/templates/`
- [x] 4.2 Update invocation detection in `src/core/command-generation/invocation.ts` (filename prefix check `orbit-`)
- [x] 4.3 Sweep `skills/` sources: `specorbit-*` references, `@orbit`/`$specorbit-` spellings, skill bodies
- [x] 4.4 Update `src/utils/command-references.ts` and `src/core/onboarding-commands.ts` spelling hints (`/orbit-<id>`, `@orbit-<id>`, `$specorbit-<skill>`)
- [x] 4.5 Regenerate parity hashes via `scripts/regen-parity-hashes.mjs` (or `pnpm regen:parity-hashes`)

## 5. Package, build, and repo metadata

- [x] 5.1 `package.json`: name `specorbit`, bin `specorbit` -> `bin/specorbit.js`, description, SEO keywords, homepage/repository placeholders (`https://github.com/specorbit/specorbit`), author, remove `@fission-ai`/`specorbit` keywords
- [x] 5.2 Update `build.js` (build banner), `scripts/*.mjs` (`pack-version-check`, `generate-skillssh`), `eslint.config.js`, `vitest.config.ts`, `vitest.setup.ts`, `tsconfig.json` (if paths reference renames)
- [x] 5.3 Update `flake.nix` (package name, bin), `.devcontainer`, `.coderabbit.yaml`, `.github/workflows/ci.yml` + `release-prepare.yml` (badge URLs, paths)
- [x] 5.4 Update `schemas/` markers if any reference brand names (verify; `spec-driven` name stays)

## 6. Planning root content sweep

- [x] 6.1 Sweep `specorbit/` contents with the same string map (config.yaml, specs, changes, archive; keep historical narrative intact where it documents past behavior)
- [x] 6.2 Rename `.specorbit.yaml` metadata files inside `specorbit/changes/` to `.specorbit.yaml`

## 7. Docs and identity surfaces

- [x] 7.1 Rewrite `README.md`: SpecOrbit positioning (SpecOrbit delta engine + AI-native SDLC lifecycle), install `npm install -g specorbit`, `/orbit:` usage examples, fork attribution to Fission-AI/OpenSpec, MIT
- [x] 7.2 Sweep `docs/` (`specorbit` -> `specorbit`, `/orbit:` -> `/orbit:`, install instructions)
- [x] 7.3 Add fork header note to `CHANGELOG.md`; update `CONTRIBUTING.md`, `SECURITY.md` (contacts), `MAINTAINERS.md` (fork maintainer + upstream credit)
- [x] 7.4 Update `install.md`, `assets/` logo references; add placeholder `specorbit` SVG mark
- [x] 7.5 Sweep `test/` fixtures and expected strings to the new names

## 8. Verification

- [x] 8.1 `pnpm build` succeeds
- [x] 8.2 `pnpm test` green (fix fallout iteratively)
- [x] 8.3 Residual scan: `rg -i "specorbit|orbit|fission"` outside allowlist (CHANGELOG history, attribution notes, archived docs' historical references)
- [x] 8.4 Sandbox smoke test: `specorbit init` scaffolds `specorbit/`, generates `orbit-`/`specorbit-` skill and command files, prints `/orbit:` spellings
- [ ] 8.5 Windows CI verification for path-renaming changes (per project rules): confirm tests use `path.join()` and CI matrix passes
- [x] 8.6 `npm publish --dry-run` accepts the name `specorbit`
