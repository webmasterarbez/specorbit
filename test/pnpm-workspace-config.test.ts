import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const projectRoot = process.cwd();

function readJson(relativePath: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'));
}

function readYaml(relativePath: string): Record<string, any> {
  return parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'));
}

describe('pnpm workspace configuration', () => {
  it('keeps root build approval aligned and security overrides single-sourced', () => {
    const packageJson = readJson('package.json');
    const lockfile = readYaml('pnpm-lock.yaml');
    const workspace = readYaml('pnpm-workspace.yaml');
    const esbuildVersions = Object.keys(lockfile.packages)
      .filter((key) => key.startsWith('esbuild@'))
      .map((key) => key.slice('esbuild@'.length));

    expect(workspace.packages).toEqual(['.']);
    // Build approvals are single-sourced in pnpm-workspace.yaml `allowBuilds`.
    // The vestigial `pnpm.onlyBuiltDependencies` field in package.json is no
    // longer read by pnpm and MUST stay absent so it cannot drift.
    expect(packageJson.pnpm).toBeUndefined();
    expect(esbuildVersions).toHaveLength(1);
    expect(workspace.allowBuilds).toEqual({
      [`esbuild@${esbuildVersions[0]}`]: true,
    });
    // Overrides are declared once, in pnpm-workspace.yaml. A `pnpm.overrides` block
    // in package.json replaces that list rather than merging with it, and Dependabot
    // rewrites plain-name entries there when it bumps the same package — so a mirrored
    // copy silently displaces the pins that patch advisories. (`packageJson.pnpm`
    // is asserted absent above, which covers this.)
    expect(workspace.overrides).toEqual(lockfile.overrides);
  });

  // The fork dropped upstream's website/ (see specorbit/changes/rebrand-fork-as-specorbit);
  // there is no second locked project to keep aligned anymore.

  it('includes install policy changes in Nix and security validation', () => {
    const flake = fs.readFileSync(path.join(projectRoot, 'flake.nix'), 'utf8');
    const ci = fs.readFileSync(path.join(projectRoot, '.github/workflows/ci.yml'), 'utf8');
    const security = fs.readFileSync(
      path.join(projectRoot, '.github/workflows/security.yml'),
      'utf8'
    );

    expect(flake).toContain('./pnpm-workspace.yaml');
    expect(ci).toContain("- 'pnpm-workspace.yaml'");
    expect(security).toContain("- '**/pnpm-workspace.yaml'");
  });
});
