import { CliError } from '../errors.js';
import type { RepoContext } from '../repo-context.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The two YAML files the docs toolkit builds the site from. Both are plain
 * block YAML written by hand, so a line scanner is enough to read the few
 * keys the CLI needs — it keeps the package free of a YAML dependency.
 */

export function bookConfigPath(context: RepoContext): string {
  return join(context.docsDir, 'src', 'book.config.yaml');
}

export function toolkitConfigPath(context: RepoContext): string {
  return join(context.docsDir, 'docs-toolkit.config.yaml');
}

export interface BookConfig {
  /** `languages:` in file order. */
  languages: string[];
  /** Markdown paths per language, in sidebar order — the published pages. */
  navigation: Record<string, string[]>;
}

interface YamlLine {
  indent: number;
  /** Text after the indent, with a leading `- ` list marker removed. */
  text: string;
  /** True when the line opened a list item. */
  item: boolean;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  const quoted = /^(["'])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
}

function yamlLines(source: string): YamlLine[] {
  const lines: YamlLine[] = [];
  for (const raw of source.split('\n')) {
    const withoutComment = raw.replace(/\s+#.*$/, '');
    if (!withoutComment.trim() || withoutComment.trim().startsWith('#')) {
      continue;
    }
    const indent = withoutComment.length - withoutComment.trimStart().length;
    let text = withoutComment.trim();
    const item = text.startsWith('- ') || text === '-';
    if (item) text = text.slice(1).trim();
    lines.push({ indent, text, item });
  }
  return lines;
}

/** `key: value` → [key, value]; a bare `key:` yields an empty value. */
function keyValue(text: string): [string, string] | null {
  const match = /^([A-Za-z0-9_.-]+):(?:\s+(.*))?$/.exec(text);
  return match ? [match[1], unquote(match[2] ?? '')] : null;
}

/** Every `path:` inside a block, whether flat, grouped or flow-mapped. */
function pathsIn(lines: YamlLine[]): string[] {
  const paths: string[] = [];
  for (const line of lines) {
    const flow = /\bpath:\s*("[^"]*"|'[^']*'|[^,}\s]+)/.exec(line.text);
    if (flow) paths.push(unquote(flow[1]));
  }
  return paths;
}

/** The lines nested under `lines[start]`, i.e. indented deeper than it. */
function block(lines: YamlLine[], start: number): YamlLine[] {
  const parent = lines[start].indent;
  const nested: YamlLine[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].indent <= parent) break;
    nested.push(lines[i]);
  }
  return nested;
}

function readConfig(file: string): YamlLine[] {
  if (!existsSync(file)) {
    throw new CliError('repo_incomplete', `Docs config not found: ${file}.`, {
      hint: 'bai-agent doctor',
    });
  }
  return yamlLines(readFileSync(file, 'utf8'));
}

export function loadBookConfig(context: RepoContext): BookConfig {
  const lines = readConfig(bookConfigPath(context));
  const languages: string[] = [];
  const navigation: Record<string, string[]> = {};
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.indent !== 0 || line.item) continue;
    const pair = keyValue(line.text);
    if (!pair) continue;
    const nested = block(lines, i);
    if (pair[0] === 'languages') {
      for (const entry of nested) {
        if (entry.item && !keyValue(entry.text))
          languages.push(unquote(entry.text));
      }
    } else if (pair[0] === 'navigation') {
      for (let j = 0; j < nested.length; j += 1) {
        const entry = nested[j];
        const langPair = entry.item ? null : keyValue(entry.text);
        if (!langPair || entry.indent !== nested[0].indent) continue;
        navigation[langPair[0]] = pathsIn(block(nested, j));
      }
    }
  }
  return { languages, navigation };
}

export interface ToolkitVersion {
  label: string;
  latest: boolean;
}

/** The `versions:` list of `docs-toolkit.config.yaml`, in file order. */
export function loadToolkitVersions(context: RepoContext): ToolkitVersion[] {
  const lines = readConfig(toolkitConfigPath(context));
  const versions: ToolkitVersion[] = [];
  const start = lines.findIndex(
    (line) =>
      line.indent === 0 &&
      !line.item &&
      keyValue(line.text)?.[0] === 'versions',
  );
  if (start < 0) return versions;
  const nested = block(lines, start);
  let current: ToolkitVersion | null = null;
  for (const line of nested) {
    if (line.item && line.indent === nested[0].indent) {
      current = { label: '', latest: false };
      versions.push(current);
    }
    const pair = keyValue(line.text);
    if (!pair || !current) continue;
    if (pair[0] === 'label') current.label = pair[1];
    if (pair[0] === 'latest') current.latest = pair[1] === 'true';
  }
  return versions.filter((version) => version.label);
}

/** The label marked `latest: true` — the channel `/latest/` redirects to. */
export function latestDocsVersion(context: RepoContext): string | null {
  return loadToolkitVersions(context).find((one) => one.latest)?.label ?? null;
}
