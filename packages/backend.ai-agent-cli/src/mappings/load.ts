import { CliError } from '../errors.js';
import { Ajv } from 'ajv';
import type { ValidateFunction } from 'ajv';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

/** The Astryx Badge variants a curated value may declare. */
export type MappingVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

export interface MappingValue {
  label?: string;
  meaning?: string;
  concept?: string;
  docs?: string;
  variant?: MappingVariant;
}

export interface MappingField {
  label?: string;
  meaning?: string;
  concept?: string;
  docs?: string;
  values?: Record<string, MappingValue>;
}

export interface Mapping {
  type: string;
  label?: string;
  meaning?: string;
  concept?: string;
  docs?: string;
  fields?: Record<string, MappingField>;
}

export interface MappingFile {
  /** `mappings/<Type>.yaml`, relative to the CLI package. */
  file: string;
  path: string;
  mapping: Mapping;
}

export interface MappingLoadIssue {
  file: string;
  path: string;
  message: string;
}

export interface MappingSet {
  dir: string;
  files: MappingFile[];
  byType: Map<string, MappingFile>;
  /** Files that failed to parse or failed schema.json validation. */
  issues: MappingLoadIssue[];
}

export const MAPPINGS_DIR_NAME = 'mappings';
export const MAPPINGS_SCHEMA_FILE = 'schema.json';

/**
 * The package's own `mappings/` directory. Walking up from this module works
 * from `src/` and from the bundled `dist/` alike.
 */
export function defaultMappingsDir(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = join(dir, MAPPINGS_DIR_NAME);
    if (existsSync(join(candidate, MAPPINGS_SCHEMA_FILE))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new CliError(
    'repo_incomplete',
    `Cannot locate the ${MAPPINGS_DIR_NAME}/ directory shipped with this CLI.`,
    { hint: 'pnpm --filter backend.ai-agent-cli build' },
  );
}

const VALIDATORS = new Map<string, ValidateFunction>();

function validatorFor(dir: string): ValidateFunction {
  const cached = VALIDATORS.get(dir);
  if (cached) return cached;
  const file = join(dir, MAPPINGS_SCHEMA_FILE);
  let schema: unknown;
  try {
    schema = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new CliError('internal', `Cannot parse ${file}.`, {
      hint: `${MAPPINGS_DIR_NAME}/${MAPPINGS_SCHEMA_FILE}`,
      cause: error,
    });
  }
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema as object);
  VALIDATORS.set(dir, validate);
  return validate;
}

const formatErrors = (validate: ValidateFunction): string =>
  (validate.errors ?? [])
    .map((error) =>
      `${error.instancePath || '/'} ${error.message ?? ''}`.trim(),
    )
    .join('; ');

const CACHE = new Map<string, MappingSet>();

/** Every `<Type>.yaml` under `dir`, parsed and validated against schema.json. */
export function loadMappings(dir = defaultMappingsDir()): MappingSet {
  const cached = CACHE.get(dir);
  if (cached) return cached;

  const validate = validatorFor(dir);
  const files: MappingFile[] = [];
  const issues: MappingLoadIssue[] = [];
  const byType = new Map<string, MappingFile>();
  const names = existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => name.endsWith('.yaml') || name.endsWith('.yml'))
        .sort()
    : [];

  for (const name of names) {
    const path = join(dir, name);
    const file = `${MAPPINGS_DIR_NAME}/${name}`;
    let parsed: unknown;
    try {
      parsed = parseYaml(readFileSync(path, 'utf8'));
    } catch (error) {
      issues.push({
        file,
        path,
        message: `YAML parse error: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
      });
      continue;
    }
    if (!validate(parsed)) {
      issues.push({ file, path, message: formatErrors(validate) });
      continue;
    }
    const mapping = parsed as Mapping;
    const stem = basename(name, extname(name));
    if (mapping.type !== stem) {
      issues.push({
        file,
        path,
        message: `type "${mapping.type}" does not match the file name stem "${stem}"`,
      });
      continue;
    }
    const duplicate = byType.get(mapping.type);
    if (duplicate) {
      issues.push({
        file,
        path,
        message: `type "${mapping.type}" is already mapped by ${duplicate.file}`,
      });
      continue;
    }
    const entry: MappingFile = { file, path, mapping };
    files.push(entry);
    byType.set(mapping.type, entry);
  }

  const set: MappingSet = { dir, files, byType, issues };
  CACHE.set(dir, set);
  return set;
}

export function clearMappingCache(): void {
  CACHE.clear();
  VALIDATORS.clear();
}

/** The mapping file path relative to a repository root, for display. */
export function mappingDisplayPath(repoRoot: string, path: string): string {
  const rel = relative(repoRoot, path).split(sep).join('/');
  return rel.startsWith('..') ? path : rel;
}
