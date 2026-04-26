/**
 * Versioned documentation support (F6 / FR-2718).
 *
 * Implements the minor-grained version model declared by the optional
 * `versions` key in `docs-toolkit.config.yaml`. Responsibilities:
 *
 *   - Validate the raw `VersionEntry[]` from config (label uniqueness,
 *     exactly one `latest: true`, well-formed `source.kind`).
 *   - Normalize entries into a runtime-friendly `Version[]` shape.
 *   - Resolve each version's content source root (workspace checkout vs
 *     a `docs-archive/<minor>` orphan branch).
 *   - Expose the (version, lang, slug) enumeration that the sitemap and
 *     canonical-URL builders in F2 will consume.
 *
 * Single-version compatibility mode (no `versions` declared) is handled
 * by the caller — this module never invents a default version.
 *
 * IMPORTANT: this module never mutates global state and never touches
 * the filesystem outside of optionally inspecting whether an
 * archive-branch worktree exists (a best-effort warn-and-skip path).
 */

import fs from "fs";
import path from "path";
import type {
  ResolvedDocConfig,
  VersionEntry,
  VersionSource,
} from "./config.js";

/**
 * Strict `MAJOR.MINOR` shape for `versions[].label`. Mirrors the regex
 * used by the GitHub release-archive workflow so config validation
 * catches any deviation (patch suffix, pre-release tag, slash, etc.)
 * at load time rather than letting it leak into URL paths and filesystem
 * segments downstream.
 */
const MINOR_LABEL = /^[0-9]+\.[0-9]+$/;

/**
 * Runtime-normalized version entry. One per minor version that survives
 * validation. The `outDir` lives directly under the website output root
 * (`<distDir>/<websiteOutDir>/<outDir>/<lang>/...`) and is identical to
 * `label` — kept as a separate field so callers do not have to know the
 * "label == directory name" coupling.
 */
export interface Version {
  /** e.g. "25.16" — used as the URL segment and selector display label. */
  label: string;
  /** Source-of-content kind. */
  source: VersionSource;
  /** True for exactly one entry (the default the root index resolves to). */
  isLatest: boolean;
  /** The directory segment under `dist/web/` for this version. Equal to `label`. */
  outDir: string;
}

/**
 * Result of `loadVersions`. `enabled` is the only field callers should
 * check before iterating: when `false`, the build runs in single-version
 * compatibility mode and the rest of the fields are empty.
 */
export interface LoadedVersions {
  /** True when the config declared a non-empty `versions` array that passed validation. */
  enabled: boolean;
  /** Validated, normalized entries. Empty when `enabled === false`. */
  entries: Version[];
  /** The `isLatest === true` entry, or null when `enabled === false`. */
  latest: Version | null;
}

/**
 * Validate the raw `versions` config and produce a normalized list.
 * Throws on hard schema violations (so the build fails fast on malformed
 * config). Returns `{ enabled: false }` when `versions` was not declared
 * at all — that is the single-version compatibility code path and is
 * NOT a validation error.
 */
export function loadVersions(config: ResolvedDocConfig): LoadedVersions {
  const raw = config.versions;
  if (!raw) {
    return { enabled: false, entries: [], latest: null };
  }
  if (!Array.isArray(raw)) {
    throw new Error(
      `docs-toolkit.config.yaml: "versions" must be an array of entries. ` +
        `Got: ${typeof raw}.`,
    );
  }
  if (raw.length === 0) {
    // Treat an explicit empty array the same as "not declared" — the
    // user might be staging the key. Falls back to flat layout.
    return { enabled: false, entries: [], latest: null };
  }

  const seenLabels = new Set<string>();
  const normalized: Version[] = [];
  let latestCount = 0;

  for (const [index, entry] of raw.entries()) {
    validateEntryShape(entry, index);
    if (seenLabels.has(entry.label)) {
      throw new Error(
        `docs-toolkit.config.yaml: "versions[${index}].label" duplicates an earlier entry: ` +
          `"${entry.label}". Each minor must appear exactly once.`,
      );
    }
    seenLabels.add(entry.label);

    if (entry.latest === true) {
      latestCount++;
    }

    normalized.push({
      label: entry.label,
      source: entry.source,
      isLatest: entry.latest === true,
      outDir: entry.label,
    });
  }

  if (latestCount !== 1) {
    throw new Error(
      `docs-toolkit.config.yaml: exactly one "versions[].latest: true" entry is required. ` +
        `Got: ${latestCount}.`,
    );
  }

  const latest = normalized.find((v) => v.isLatest) ?? null;
  return { enabled: true, entries: normalized, latest };
}

function validateEntryShape(entry: VersionEntry, index: number): void {
  if (!entry || typeof entry !== "object") {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}]" must be an object.`,
    );
  }
  if (typeof entry.label !== "string" || entry.label.length === 0) {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}].label" must be a non-empty string ` +
        `(e.g., "25.16"). Got: ${JSON.stringify(entry.label)}.`,
    );
  }
  // The selector lists minor versions only. Enforce strict `MAJOR.MINOR`
  // shape (matching the GitHub release-archive workflow's regex) so any
  // deviation — patch suffix, pre-release tag, slash, etc. — fails fast at
  // config load time instead of leaking into URL paths or filesystem
  // segments downstream.
  if (!MINOR_LABEL.test(entry.label)) {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}].label" must match ^[0-9]+\\.[0-9]+$ ` +
        `(minor only, e.g., "25.16"). Got: ${JSON.stringify(entry.label)}. The selector never ` +
        `lists patches; the highest patch within a minor is built and published as that minor.`,
    );
  }
  if (!entry.source || typeof entry.source !== "object") {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}].source" must be an object with a "kind" field.`,
    );
  }
  const kind = (entry.source as VersionSource).kind;
  if (kind !== "workspace" && kind !== "archive-branch") {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}].source.kind" must be ` +
        `"workspace" or "archive-branch". Got: ${JSON.stringify(kind)}.`,
    );
  }
  if (kind === "archive-branch") {
    const ref = (entry.source as { kind: "archive-branch"; ref: string }).ref;
    if (typeof ref !== "string" || ref.length === 0) {
      throw new Error(
        `docs-toolkit.config.yaml: "versions[${index}].source.ref" is required when ` +
          `kind is "archive-branch" (e.g., "docs-archive/25.16").`,
      );
    }
  }
}

/**
 * Find the entry marked `latest: true`. Throws when called on a
 * disabled/empty `LoadedVersions` — callers must check `.enabled` first.
 */
export function findLatest(loaded: LoadedVersions): Version {
  if (!loaded.latest) {
    throw new Error(
      "findLatest() called but no version is marked latest. " +
        "Check `loaded.enabled` before invoking.",
    );
  }
  return loaded.latest;
}

/**
 * Result of attempting to resolve a version's content source to a real
 * directory on disk. Used by the website generator to decide whether to
 * build that version or skip it with a warning.
 */
export interface ResolvedVersionSource {
  /** Absolute path to the directory the build should consume (or fall back to). */
  rootDir: string | null;
  /** True when the source resolved cleanly. */
  ok: boolean;
  /** Optional warning to surface when ok === false. */
  warning?: string;
}

/**
 * Resolve a version's `source` to a project root the build can read.
 *
 * For `workspace`, this is always `config.projectRoot` — the current
 * checkout. For `archive-branch`, this looks for a sibling worktree at
 * `<projectRoot>/.docs-archive/<branch-segment>`; if absent, returns
 * `ok: false` with a warning. Materializing the archive-branch worktree
 * (`git worktree add`) is out of scope for v1 — the operational rollout
 * spec covers it, and v1 deliberately ships with `workspace` as the
 * only fully-exercised path.
 */
export function resolveVersionSource(
  config: ResolvedDocConfig,
  version: Version,
): ResolvedVersionSource {
  const src = version.source;
  if (src.kind === "workspace") {
    return { rootDir: config.projectRoot, ok: true };
  }
  // archive-branch: look for a pre-checked-out worktree under
  // `<projectRoot>/.docs-archive/<sanitized-branch>`. The release-time
  // CI workflow that PUSHES the orphan branch lives in this PR; the
  // workflow/operator that PULLS it into a worktree before rebuild is
  // operational scope.
  //
  // Reject refs containing `..`, leading `/`, or leading `.` — without
  // these guards a `replace(/[^A-Za-z0-9._/-]/g, "_")` pass would happily
  // preserve a `..` segment, and `path.join(projectRoot, ".docs-archive",
  // "..")` would resolve to `projectRoot` (or worse). Bail out loudly
  // rather than silently building from an unintended directory.
  if (
    src.ref.includes("..") ||
    src.ref.startsWith("/") ||
    src.ref.startsWith(".")
  ) {
    throw new Error(
      `Version "${version.label}" archive-branch ref contains unsafe segments: ` +
        `${JSON.stringify(src.ref)}. Refs must not include "..", a leading "/", or a leading ".".`,
    );
  }
  const safeRef = src.ref
    .replace(/[^A-Za-z0-9._/-]/g, "_")
    .replace(/\//g, "__");
  const candidate = path.join(config.projectRoot, ".docs-archive", safeRef);
  if (fs.existsSync(candidate)) {
    return { rootDir: candidate, ok: true };
  }
  return {
    rootDir: null,
    ok: false,
    warning:
      `Version "${version.label}" source "archive-branch:${src.ref}" not materialized at ` +
      `${candidate}. Skipping. (Run the docs-archive checkout workflow before building, ` +
      `or remove the entry from "versions".)`,
  };
}

/**
 * One row in the (version, lang, slug) enumeration consumed by F2's
 * sitemap and canonical-URL generators. `path` is the URL path relative
 * to the website output root (no leading slash, no trailing index).
 */
export interface PageEnumerationRow {
  version: string;
  lang: string;
  slug: string;
  /** URL-relative path. e.g. `25.16/en/session-page.html` (versioned) or `en/session-page.html` (flat). */
  path: string;
  /** True when this row was emitted by the `latest` version (or by flat single-version mode). */
  isLatest: boolean;
}

/**
 * Build the canonical URL path for a slug in the latest version. F2
 * uses this to populate `<link rel="canonical">` on every page so that
 * non-latest versions point readers at the live latest version.
 *
 * In flat mode, the canonical is simply `<lang>/<slug>.html`.
 */
export function canonicalPathFor(
  loaded: LoadedVersions,
  lang: string,
  slug: string,
): string {
  if (!loaded.enabled || !loaded.latest) {
    return `${lang}/${slug}.html`;
  }
  return `${loaded.latest.label}/${lang}/${slug}.html`;
}

/**
 * Cross-version slug map: for a given slug, which versions contain it.
 * The header version selector uses this to fall back to the version's
 * index page when a slug doesn't exist there.
 *
 * Built incrementally by the website generator as it processes each
 * version's chapters; F2's sitemap emitter consumes the final form.
 */
export class VersionPageRegistry {
  private rows: PageEnumerationRow[] = [];
  /** version → set of slugs that exist under that version (any lang). */
  private slugsByVersion = new Map<string, Set<string>>();

  record(row: PageEnumerationRow): void {
    this.rows.push(row);
    let bucket = this.slugsByVersion.get(row.version);
    if (!bucket) {
      bucket = new Set<string>();
      this.slugsByVersion.set(row.version, bucket);
    }
    bucket.add(row.slug);
  }

  /** True when `slug` exists in `version` (any language). */
  hasSlug(version: string, slug: string): boolean {
    return this.slugsByVersion.get(version)?.has(slug) === true;
  }

  /** All recorded rows, in insertion order. F2 iterates this for sitemap.xml. */
  enumerateAll(): readonly PageEnumerationRow[] {
    return this.rows;
  }
}
