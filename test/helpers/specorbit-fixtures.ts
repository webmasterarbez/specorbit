import * as fs from 'node:fs';
import * as path from 'node:path';

/** Minimal healthy SpecOrbit root layout shared by slice test suites. */
export function createSpecOrbitRoot(rootDir: string): void {
  fs.mkdirSync(path.join(rootDir, 'specorbit', 'specs'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'specorbit', 'changes', 'archive'), { recursive: true });
  fs.writeFileSync(path.join(rootDir, 'specorbit', 'config.yaml'), 'schema: spec-driven\n');
}

/** Writes a spec file under the root's specorbit/specs/<id>/spec.md. */
export function writeSpec(rootDir: string, specId: string, body: string): void {
  const specDir = path.join(rootDir, 'specorbit', 'specs', specId);
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(path.join(specDir, 'spec.md'), body);
}
