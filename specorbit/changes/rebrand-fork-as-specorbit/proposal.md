## Why

This repository is being rebranded as the foundation of an independent fork, **SpecOrbit** (a spec-driven, agent-agnostic SDLC engine extending SpecOrbit with the Anthropic AI-Native SDLC Playbook lifecycle). The inherited SpecOrbit branding — package name, CLI binary, directory conventions, slash-command prefix, environment variables, and documentation — must be replaced with SpecOrbit identity so the fork can be published, discovered, and dogfooded under its own name. The name "specloop" was evaluated and rejected: two live commercial products (specloop.dev, specloop.ai), an arXiv paper, and two hyphen-variant GitHub repos already occupy that name's search landscape, and the `@specloop` npm scope is owned by another product.

## What Changes

- **BREAKING** The npm package becomes `specorbit` (unscoped), with binary `specorbit` replacing `specorbit`.
- **BREAKING** The planning directory a project scaffolds becomes `specorbit/` (was `specorbit/`), including `specorbit/config.yaml`, `specorbit/specs/`, `specorbit/changes/`, and per-change `.specorbit.yaml` metadata (was `.specorbit.yaml`).
- **BREAKING** Environment variables are renamed: `SPECORBIT_*` becomes `SPECORBIT_*` (telemetry, update check, animation, completions, concurrency, allowed tools).
- **BREAKING** The global config/data directories become `~/.config/specorbit/` and `~/.local/share/specorbit/` (XDG) with Windows equivalents (was `specorbit`).
- **BREAKING** Slash-command prefix becomes `/orbit:` (was `/orbit:`), with per-tool spellings `orbit-<id>` filenames, `orbit/` namespaces, `@orbit-<id>` (Amazon Q), and `$specorbit-<skill>` (Codex) following each tool's existing registration rules.
- The CLI self-update and version-check flow installs `specorbit` from npm instead of `specorbit`.
- Generated agent instructions, skills, welcome screens, help text, deprecation messages, and error guidance reference `specorbit` and `/orbit:` instead of `specorbit` and `/orbit:`.
- This repository's own planning root is renamed `specorbit/` -> `specorbit/`, keeping all content (specs, changes, archive history) so the fork dogfoods its own format.
- Upstream-only surfaces are removed: `website/`, `docs-lab/`, `README_OLD.md`, `specorbit-parallel-merge-plan.md`.
- `README.md` is rewritten for the fork: SEO-first positioning, install via `npm install -g specorbit`, preserved MIT attribution to Fission-AI/OpenSpec.
- Legacy cleanup patterns, parity hashes, and generated-file markers are updated to track the new names.

## Capabilities

### New Capabilities

(none — no new behavior is introduced; this change renames existing surfaces)

### Modified Capabilities

- `specorbit-conventions`: Project Structure requirement now specifies the `specorbit/` directory; Verb–Noun CLI examples use `specorbit`.
- `cli-init`: Directory Creation, Slash Command Generation, and Skill Generation requirements scaffold `specorbit/` and generate `orbit-`/`specorbit-` command and skill files.
- `command-generation`: adapter file paths use `orbit/` namespaces and `orbit-<id>` filenames; command bodies reference `/orbit:`.
- `global-config`: global configuration is stored under `specorbit` config/data directories on every platform.
- `telemetry`: opt-out and first-run notice use `SPECORBIT_TELEMETRY`.

## Impact

- **Code**: `src/` (~112 files) — constants in `src/core/config.ts`, `src/core/specorbit-root.ts`, `src/core/global-config.ts`; CLI name and strings across `src/cli/index.ts`, `src/commands/`, `src/ui/`, `src/core/` (templates, command-generation adapters, cloud-agent prompts, version-check self-update).
- **Tests**: ~144 test files with fixtures and expected strings/paths.
- **Package/build**: `package.json`, `bin/specorbit.js` -> `bin/specorbit.js`, `build.js`, `scripts/*.mjs`, `flake.nix`, `eslint.config.js`, `vitest.config.ts`.
- **Generated assets**: `skills/specorbit-*` -> `skills/specorbit-*`, parity hashes, `schemas/` markers (schema name `spec-driven` is not brand-bearing and is unchanged).
- **Repo surfaces**: README, docs, CI workflows, SECURITY.md, CONTRIBUTING.md, MAINTAINERS.md, CHANGELOG header; removal of website/ and docs-lab/.
- **Users**: no installed base exists for the fork, so the breaking renames carry no migration burden; existing upstream SpecOrbit users are unaffected (they remain on the upstream package).
- **Cross-platform**: all path construction uses `path.join()`/`path.resolve()`; Windows CI verification is required for the directory-rename work (per project rules).
