import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { FileSystemUtils } from '../utils/file-system.js';
import { serializeConfig } from './config-prompts.js';
import {
  makeStoreDiagnostic,
  type StoreDiagnostic,
} from './store/errors.js';

export const SPECORBIT_ROOT_DIR = 'specorbit';
export const SPECORBIT_CONFIG_YAML = 'specorbit/config.yaml';
export const SPECORBIT_CONFIG_YML = 'specorbit/config.yml';
export const SPECORBIT_SPECS_DIR = 'specorbit/specs';
export const SPECORBIT_CHANGES_DIR = 'specorbit/changes';
export const SPECORBIT_ARCHIVE_DIR = 'specorbit/changes/archive';
export const DEFAULT_SPECORBIT_SCHEMA = 'spec-driven';
export const DIRECTORY_ANCHOR_FILE_NAME = '.gitkeep';

// Git cannot track empty directories, so setup anchors otherwise-empty
// conventional store directories for teammates who clone the repo later.
export const ANCHORED_SPECORBIT_DIRS = [SPECORBIT_SPECS_DIR, SPECORBIT_ARCHIVE_DIR] as const;

type PathKind = 'missing' | 'directory' | 'file' | 'other';

export interface CreatedPathLedgerEntry {
  relativePath: string;
  absolutePath: string;
  kind: 'directory' | 'file';
}

export interface SpecOrbitRootInspection {
  present: boolean | null;
  config: {
    present: boolean | null;
    path?: string;
  };
  specs: {
    present: boolean | null;
  };
  changes: {
    present: boolean | null;
  };
  archive: {
    present: boolean | null;
  };
  healthy: boolean;
  diagnostics: StoreDiagnostic[];
}

export interface EnsureSpecOrbitRootResult {
  inspection: SpecOrbitRootInspection;
  createdArtifacts: string[];
  createdPaths: CreatedPathLedgerEntry[];
}

async function pathKind(targetPath: string): Promise<PathKind> {
  try {
    const stat = await fs.stat(targetPath);
    if (stat.isDirectory()) return 'directory';
    if (stat.isFile()) return 'file';
    return 'other';
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return 'missing';
    }

    throw error;
  }
}

function relativeArtifact(relativePath: string, kind: CreatedPathLedgerEntry['kind']): string {
  const normalized = FileSystemUtils.toPosixPath(relativePath);
  return kind === 'directory' ? `${normalized}/` : normalized;
}

function unresolvedInspection(): SpecOrbitRootInspection {
  return {
    present: null,
    config: { present: null },
    specs: { present: null },
    changes: { present: null },
    archive: { present: null },
    healthy: false,
    diagnostics: [],
  };
}

function missingDirectoryDiagnostic(
  code: string,
  message: string,
  target: string
): StoreDiagnostic {
  return makeStoreDiagnostic('error', code, message, { target });
}

type OptionalPlanningDirectoryKey = 'specs' | 'changes' | 'archive';

async function inspectOptionalPlanningDirectory(
  inspection: SpecOrbitRootInspection,
  storeRoot: string,
  key: OptionalPlanningDirectoryKey,
  relativePath: string,
  notDirectoryCode: string,
  target: string
): Promise<PathKind> {
  const kind = await pathKind(path.join(storeRoot, relativePath));
  inspection[key] = { present: kind === 'directory' };
  if (kind === 'directory' || kind === 'missing') return kind;

  inspection.diagnostics.push(missingDirectoryDiagnostic(
    notDirectoryCode,
    `${relativePath}/ exists but is not a directory.`,
    target
  ));
  return kind;
}

export async function inspectSpecOrbitRoot(storeRoot: string): Promise<SpecOrbitRootInspection> {
  const rootKind = await pathKind(storeRoot);
  const inspection = unresolvedInspection();

  if (rootKind === 'missing') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'specorbit_store_root_missing',
      'Store root does not exist.',
      'store.root'
    ));
    return inspection;
  }

  if (rootKind !== 'directory') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'specorbit_store_root_not_directory',
      'Store root is not a directory.',
      'store.root'
    ));
    return inspection;
  }

  const specorbitPath = path.join(storeRoot, SPECORBIT_ROOT_DIR);
  const specorbitKind = await pathKind(specorbitPath);
  inspection.present = specorbitKind === 'directory';

  if (specorbitKind === 'missing') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'specorbit_root_missing',
      'Missing specorbit/ directory.',
      'specorbit.root'
    ));
    return inspection;
  }

  if (specorbitKind !== 'directory') {
    inspection.diagnostics.push(missingDirectoryDiagnostic(
      'specorbit_root_not_directory',
      'specorbit/ exists but is not a directory.',
      'specorbit.root'
    ));
    return inspection;
  }

  const configYamlKind = await pathKind(path.join(storeRoot, SPECORBIT_CONFIG_YAML));
  const configYmlKind = await pathKind(path.join(storeRoot, SPECORBIT_CONFIG_YML));
  if (configYamlKind === 'file') {
    inspection.config = { present: true, path: SPECORBIT_CONFIG_YAML };
  } else if (configYmlKind === 'file') {
    inspection.config = { present: true, path: SPECORBIT_CONFIG_YML };
  } else {
    inspection.config = { present: false };
    if (configYamlKind !== 'missing' || configYmlKind !== 'missing') {
      inspection.diagnostics.push(missingDirectoryDiagnostic(
        'specorbit_config_not_file',
        'SpecOrbit config path exists but is not a file.',
        'specorbit.config'
      ));
    } else {
      inspection.diagnostics.push(missingDirectoryDiagnostic(
        'specorbit_config_missing',
        'Missing specorbit/config.yaml or specorbit/config.yml.',
        'specorbit.config'
      ));
    }
  }

  await inspectOptionalPlanningDirectory(
    inspection,
    storeRoot,
    'specs',
    SPECORBIT_SPECS_DIR,
    'specorbit_specs_not_directory',
    'specorbit.specs'
  );
  const changesKind = await inspectOptionalPlanningDirectory(
    inspection,
    storeRoot,
    'changes',
    SPECORBIT_CHANGES_DIR,
    'specorbit_changes_not_directory',
    'specorbit.changes'
  );
  if (changesKind === 'directory') {
    await inspectOptionalPlanningDirectory(
      inspection,
      storeRoot,
      'archive',
      SPECORBIT_ARCHIVE_DIR,
      'specorbit_archive_not_directory',
      'specorbit.archive'
    );
  } else {
    inspection.archive = { present: false };
  }

  inspection.healthy =
    inspection.present === true &&
    inspection.config.present === true &&
    inspection.diagnostics.length === 0;

  return inspection;
}

async function ensureDirectory(
  storeRoot: string,
  relativePath: string,
  ledger: CreatedPathLedgerEntry[]
): Promise<void> {
  const absolutePath = path.join(storeRoot, relativePath);
  const kind = await pathKind(absolutePath);

  if (kind === 'directory') return;
  if (kind !== 'missing') {
    throw new Error(`${relativePath}/ exists but is not a directory.`);
  }

  await fs.mkdir(absolutePath, { recursive: true });
  ledger.push({
    relativePath: relativeArtifact(relativePath, 'directory'),
    absolutePath,
    kind: 'directory',
  });
}

async function ensureDefaultConfig(
  storeRoot: string,
  ledger: CreatedPathLedgerEntry[]
): Promise<void> {
  const configYamlPath = path.join(storeRoot, SPECORBIT_CONFIG_YAML);
  const configYmlPath = path.join(storeRoot, SPECORBIT_CONFIG_YML);
  const yamlKind = await pathKind(configYamlPath);
  const ymlKind = await pathKind(configYmlPath);

  if (yamlKind === 'file' || ymlKind === 'file') return;
  if (yamlKind !== 'missing' || ymlKind !== 'missing') {
    throw new Error('SpecOrbit config path exists but is not a file.');
  }

  await FileSystemUtils.writeFile(
    configYamlPath,
    serializeConfig({ schema: DEFAULT_SPECORBIT_SCHEMA })
  );
  ledger.push({
    relativePath: relativeArtifact(SPECORBIT_CONFIG_YAML, 'file'),
    absolutePath: configYamlPath,
    kind: 'file',
  });
}

export async function ensureDirectoryAnchor(
  storeRoot: string,
  relativeDir: string,
  ledger: CreatedPathLedgerEntry[] = []
): Promise<void> {
  const directory = path.join(storeRoot, relativeDir);
  if ((await fs.readdir(directory)).length > 0) return;

  const relativePath = `${relativeDir}/${DIRECTORY_ANCHOR_FILE_NAME}`;
  const absolutePath = path.join(directory, DIRECTORY_ANCHOR_FILE_NAME);
  try {
    // A file or symlink may appear after readdir. Never replace or follow it.
    await fs.writeFile(absolutePath, '', { encoding: 'utf-8', flag: 'wx' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return;
    throw error;
  }
  ledger.push({
    relativePath: relativeArtifact(relativePath, 'file'),
    absolutePath,
    kind: 'file',
  });
}

export interface EnsureSpecOrbitRootOptions {
  anchorEmptyDirectories?: boolean;
}

export async function ensureSpecOrbitRoot(
  storeRoot: string,
  options: EnsureSpecOrbitRootOptions = {}
): Promise<EnsureSpecOrbitRootResult> {
  const ledger: CreatedPathLedgerEntry[] = [];
  const rootKind = await pathKind(storeRoot);

  if (rootKind === 'missing') {
    await fs.mkdir(storeRoot, { recursive: true });
  } else if (rootKind !== 'directory') {
    throw new Error('Store root is not a directory.');
  }

  await ensureDirectory(storeRoot, SPECORBIT_ROOT_DIR, ledger);
  await ensureDirectory(storeRoot, SPECORBIT_SPECS_DIR, ledger);
  await ensureDirectory(storeRoot, SPECORBIT_CHANGES_DIR, ledger);
  await ensureDirectory(storeRoot, SPECORBIT_ARCHIVE_DIR, ledger);
  await ensureDefaultConfig(storeRoot, ledger);

  if (options.anchorEmptyDirectories) {
    for (const relativeDir of ANCHORED_SPECORBIT_DIRS) {
      await ensureDirectoryAnchor(storeRoot, relativeDir, ledger);
    }
  }

  return {
    inspection: await inspectSpecOrbitRoot(storeRoot),
    createdArtifacts: ledger.map((entry) => entry.relativePath),
    createdPaths: ledger,
  };
}

export async function rollbackCreatedPaths(entries: CreatedPathLedgerEntry[]): Promise<void> {
  for (const entry of [...entries].reverse()) {
    if (entry.kind === 'file') {
      await fs.rm(entry.absolutePath, { force: true }).catch(() => undefined);
    } else {
      await fs.rmdir(entry.absolutePath).catch(() => undefined);
    }
  }
}
