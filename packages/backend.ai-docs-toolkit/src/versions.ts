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
 *
 * One literal exception: the sentinel label `"next"` (see `NEXT_LABEL`)
 * is accepted IFF its `source.kind === "workspace"`. The `next` channel
 * always tracks the current checkout and never an archived branch, so
 * the pairing is enforced as a separate validation rule below.
 */
const MINOR_LABEL = /^[0-9]+\.[0-9]+$/;

/**
 * Sentinel label for the workspace-tracking channel (FR-2710 F6). Allowed
 * as a `versions[].label` only when `source.kind === "workspace"` — the
 * pairing is intentional: `next` is rebuilt on every commit to the trunk
 * checkout, never to a frozen `docs-archive/<X.Y>` branch.
 */
const NEXT_LABEL = "next";

/**
 * Strict `vMAJOR.MINOR.PATCH` shape for `versions[].pdfTag` (FR-2731).
 * The value is interpolated into a GitHub Releases CDN URL like
 * `https://github.com/<org>/<repo>/releases/download/<pdfTag>/<asset>`,
 * so any deviation (missing `v`, missing patch, trailing suffix) would
 * yield a 404 at request time. Validate at config load instead.
 */
const PDF_TAG_REGEX = /^v[0-9]+\.[0-9]+\.[0-9]+$/;

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
  /**
   * Optional release tag (FR-2731) for building the per-version PDF
   * download URL. Validated against `^v\d+\.\d+\.\d+$` at config load.
   * `undefined` means "no PDF card for this version" — downstream
   * renderers must distinguish missing vs present rather than coercing
   * to an empty string.
   */
  pdfTag?: string;
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
      // `pdfTag` is fully optional. We deliberately omit the property
      // (rather than store `undefined` explicitly) so downstream
      // `JSON.stringify` and `'pdfTag' in v` checks behave intuitively
      // — a version without a tag has no key at all.
      ...(entry.pdfTag !== undefined ? { pdfTag: entry.pdfTag } : {}),
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
  //
  // Single exception: the literal label `"next"` (NEXT_LABEL) is allowed
  // for the workspace-tracking channel. The kind-pairing check below
  // enforces that `"next"` may only be paired with `source.kind:
  // "workspace"` — an archive-branch `"next"` is rejected with a clear
  // error rather than silently producing a directory name that collides
  // with future minors.
  if (entry.label !== NEXT_LABEL && !MINOR_LABEL.test(entry.label)) {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}].label" must match ${MINOR_LABEL.source} ` +
        `(minor only, e.g., "25.16") or be the literal "${NEXT_LABEL}" (workspace-tracking ` +
        `channel). Got: ${JSON.stringify(entry.label)}. The selector never lists patches; ` +
        `the highest patch within a minor is built and published as that minor.`,
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
  // `next` is the workspace-tracking channel by definition — it must never
  // be paired with an archived branch. Catch the misconfiguration here
  // instead of letting the build pull frozen content under a label that
  // implies "tip of trunk".
  if (entry.label === NEXT_LABEL && kind !== "workspace") {
    throw new Error(
      `docs-toolkit.config.yaml: "versions[${index}]" with label "${NEXT_LABEL}" must use ` +
        `source.kind = "workspace" (got ${JSON.stringify(kind)}). The "${NEXT_LABEL}" channel ` +
        `always tracks the current checkout, never an archived branch.`,
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
  // FR-2731: optional `pdfTag` must shape as `vMAJOR.MINOR.PATCH`. We
  // validate at config-load time rather than letting a malformed value
  // produce a 404 from the GitHub Releases CDN at request time.
  if (entry.pdfTag !== undefined) {
    if (typeof entry.pdfTag !== "string" || entry.pdfTag.length === 0) {
      throw new Error(
        `docs-toolkit.config.yaml: "versions[${index}].pdfTag" must be a non-empty string ` +
          `(e.g., "v26.4.7"). Got: ${JSON.stringify(entry.pdfTag)}.`,
      );
    }
    if (!PDF_TAG_REGEX.test(entry.pdfTag)) {
      throw new Error(
        `docs-toolkit.config.yaml: "versions[${index}].pdfTag" must match ${PDF_TAG_REGEX.source} ` +
          `(e.g., "v26.4.7"). Got: ${JSON.stringify(entry.pdfTag)}. The value is used to build a ` +
          `GitHub Releases CDN URL — a leading "v" and a full patch component are both required.`,
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
 * Choose the version string to render in the topbar brand pill for a
 * single page render (FR-2754 Fix 2).
 *
 *   - Flat / non-versioned mode (`versionLabel === null`): use the
 *     workspace version (`package.json` version + git short SHA from
 *     `getDocVersion()`). Same as pre-FR-2754 behavior.
 *   - Workspace-source version (`next`): also use the workspace
 *     version — `next` IS the workspace tip, so the SHA is meaningful.
 *   - Archive-branch version (`26.4` and earlier minors): prefer its
 *     pinned release tag (`pdfTag`, e.g. `v26.4.7`) so the pill tells
 *     the reader exactly which Backend.AI release they are reading
 *     docs for. Fall back to the version label itself when no tag was
 *     configured.
 *
 * Kept here next to `Version` / `LoadedVersions` so the rule stays in
 * one place; `website-generator.ts` just calls this from inside
 * `buildLanguage`.
 */
export function pickDisplayVersion(args: {
  workspaceVersion: string;
  versionLabel: string | null;
  versionEntry: Version | null | undefined;
}): string {
  const { workspaceVersion, versionLabel, versionEntry } = args;
  if (!versionLabel || !versionEntry) return workspaceVersion;
  if (versionEntry.source.kind === "archive-branch") {
    return versionEntry.pdfTag ?? versionEntry.label;
  }
  return workspaceVersion;
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
    this.declareSlug(row.version, row.slug);
  }

  /**
   * Mark `slug` as existing in `version` without adding a sitemap row
   * (FR-2754). The website generator's pre-pass uses this to populate
   * the slug-by-version map for every declared version BEFORE any page
   * is rendered, so the per-page `availability` map is correct
   * regardless of build/iteration order. Calling this for a slug that
   * is later passed to `record()` is harmless — `Set.add` is
   * idempotent.
   */
  declareSlug(version: string, slug: string): void {
    let bucket = this.slugsByVersion.get(version);
    if (!bucket) {
      bucket = new Set<string>();
      this.slugsByVersion.set(version, bucket);
    }
    bucket.add(slug);
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
