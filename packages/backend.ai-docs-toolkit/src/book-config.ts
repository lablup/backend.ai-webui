/**
 * Shared loader for `book.config.yaml`.
 *
 * Both the PDF and the web pipelines read the same `book.config.yaml`. The
 * raw YAML is permissive enough that authors often write `title:` as a YAML
 * block scalar (`title: |`) so the cover page can render the title across
 * multiple lines. That same value is also surfaced as `<title>`, the sidebar
 * header, and the PDF metadata — places where embedded newlines render as
 * literal `\n` glyphs and look broken.
 *
 * F1 introduces a single read site for the book config so both pipelines
 * agree on what `title` means:
 *
 *   - `title`           — single-line, whitespace-collapsed; safe for HTML
 *                         `<title>`, sidebar headers, console logs, and
 *                         PDF filename templates.
 *   - `titleMultiline`  — the original (possibly multi-line) form, preserved
 *                         only for the PDF cover page where line breaks are
 *                         load-bearing for visual layout.
 *
 * F3 extends the `navigation` schema to accept either the legacy flat list
 * form or a list of `{ category, items }` groups — see the doc-comment on
 * `RawNavigation` below. The loader normalizes whichever form it sees into
 * BOTH:
 *
 *   - `navigation`        — flat `Record<lang, NavItem[]>`. Backward-
 *                           compatible shape; what the PDF pipeline reads
 *                           and what the web cross-language slug map joins
 *                           on. Group ordering is preserved when flattening.
 *   - `navigationGroups`  — categorized `Record<lang, NavGroup[]>`. The web
 *                           sidebar reads this to render collapsible groups
 *                           and to compute the per-page breadcrumb category.
 *                           Flat input is wrapped in a single anonymous
 *                           group with `category: ""` (rendered as an
 *                           uncategorized flat list — visually identical to
 *                           the legacy sidebar).
 *
 * Soft-failure on grouped-form structural problems (empty category strings,
 * empty `items`) — a warning is printed and the offending group is dropped,
 * but the build does not crash. The PDF pipeline never sees the categories
 * (it consumes the flat `navigation`), so structural issues in the grouped
 * form never affect PDF builds.
 */

import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";

/** Single navigation item — same in both flat and grouped forms. */
export interface NavItem {
  title: string;
  path: string;
}

/** A category group (F3 grouped form). */
export interface NavGroup {
  /**
   * Localized category label shown in the sidebar and breadcrumb. Empty
   * string is reserved for the synthetic "uncategorized" group produced
   * when the input was the legacy flat form. Authors should never write
   * an empty `category:` themselves — the loader drops such groups with a
   * warning to avoid silently rendering an unlabeled drawer.
   */
  category: string;
  items: NavItem[];
}

/**
 * Per-language `navigation` value — either the legacy flat list or the F3
 * grouped form.
 *
 * Legacy (F1 and earlier; still accepted):
 *
 *   navigation:
 *     en:
 *       - { title: Quickstart, path: quickstart.md }
 *       - { title: Overview,   path: overview/overview.md }
 *
 * Grouped (F3):
 *
 *   navigation:
 *     en:
 *       - category: Getting Started
 *         items:
 *           - { title: Quickstart, path: quickstart.md }
 *       - category: Workloads
 *         items:
 *           - { title: Sessions, path: sessions/sessions.md }
 *
 * The two forms cannot be mixed within the same language — a non-grouped
 * entry inside an otherwise grouped list is dropped with a warning. Each
 * language can independently choose its form (e.g., `en` grouped, `th`
 * flat) so a translator who hasn't categorized yet doesn't block the rest
 * of the site.
 */
export type RawNavigation = NavItem[] | RawNavGroup[];

/** Grouped form before validation/normalization. */
interface RawNavGroup {
  category: string;
  items: NavItem[];
}

/**
 * Raw shape of `book.config.yaml`. Kept intentionally minimal — pipelines
 * that care about extra fields cast through `Record<string, unknown>` from
 * the same parsed object.
 */
export interface RawBookConfig {
  title: string;
  description?: string;
  languages: string[];
  navigation: Record<string, RawNavigation>;
}

/**
 * Normalized book config used by the build pipelines.
 *
 * `titleMultiline` always equals the raw value (post-`trim`, with newlines
 * preserved) so pipelines that need the visual line breaks have a stable
 * field to read. `title` is always single-line.
 *
 * `navigation` is always the flat per-language list (group ordering is
 * preserved when flattening). `navigationGroups` is the same data partitioned
 * into the F3 group form — pipelines that don't care about grouping (PDF,
 * cross-language slug map) keep using `navigation` unchanged.
 */
export interface NormalizedBookConfig {
  /** Single-line, whitespace-collapsed. Safe for `<title>` and headers. */
  title: string;
  /** Raw multi-line form. Use only where line breaks are part of the design. */
  titleMultiline: string;
  description: string;
  languages: string[];
  /** Flat per-language nav list (backward-compatible, used by PDF pipeline). */
  navigation: Record<string, NavItem[]>;
  /**
   * Per-language nav grouped into categories (F3). Always present — flat
   * input becomes a single group with `category: ""`. Web pipeline reads
   * this; PDF ignores it.
   */
  navigationGroups: Record<string, NavGroup[]>;
}

/**
 * Collapse runs of whitespace (including newlines) into a single space and
 * trim the result. Idempotent — calling twice gives the same output.
 */
export function normalizeTitle(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Type guard — does this look like a grouped entry (has `category` and
 * `items`)? Soft check: if either field is missing the entry is treated as
 * a flat NavItem, which the validator below will reject if it lacks `path`.
 */
function isGroupedEntry(entry: unknown): entry is RawNavGroup {
  if (typeof entry !== "object" || entry === null) return false;
  const obj = entry as Record<string, unknown>;
  return "category" in obj && "items" in obj;
}

/**
 * Normalize a per-language navigation value into both the flat list (for
 * PDF / slug-map consumers) and the grouped list (for the F3 web sidebar).
 *
 * Soft-fails on per-entry problems: structurally invalid entries are
 * dropped with a console warning but never crash the build. This matches
 * F5's diagnostics-sink philosophy — the build keeps going so authors see
 * the maximum amount of feedback per run.
 */
function normalizePerLangNavigation(
  lang: string,
  raw: RawNavigation | undefined,
): { flat: NavItem[]; groups: NavGroup[] } {
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return { flat: [], groups: [] };
  }

  // Decide form by inspecting the first entry. The two forms cannot be
  // mixed — entries that don't match the chosen form are dropped.
  const grouped = isGroupedEntry(raw[0]);

  if (grouped) {
    const groups: NavGroup[] = [];
    const flat: NavItem[] = [];
    for (const entry of raw) {
      if (!isGroupedEntry(entry)) {
        console.warn(
          `[book.config.yaml] navigation.${lang}: ignoring entry with no "category" inside a grouped list (mixed forms are not allowed): ${JSON.stringify(entry)}`,
        );
        continue;
      }
      const category = (entry.category ?? "").toString().trim();
      const items = Array.isArray(entry.items) ? entry.items : [];
      if (!category) {
        console.warn(
          `[book.config.yaml] navigation.${lang}: dropping group with empty category (${items.length} item(s) skipped)`,
        );
        continue;
      }
      const validItems = items.filter((it): it is NavItem => {
        if (
          typeof it !== "object" ||
          it === null ||
          typeof (it as NavItem).title !== "string" ||
          typeof (it as NavItem).path !== "string"
        ) {
          console.warn(
            `[book.config.yaml] navigation.${lang}/${category}: dropping item missing title/path: ${JSON.stringify(it)}`,
          );
          return false;
        }
        return true;
      });
      if (validItems.length === 0) {
        console.warn(
          `[book.config.yaml] navigation.${lang}: dropping group "${category}" with no valid items`,
        );
        continue;
      }
      groups.push({ category, items: validItems });
      for (const it of validItems) flat.push(it);
    }
    return { flat, groups };
  }

  // Legacy flat form. Wrap in a single anonymous group ("") so the F3 web
  // sidebar has a uniform shape to render — empty-string category gets a
  // visually-flat fallback path in `buildWebsiteSidebar`.
  const flat: NavItem[] = [];
  for (const entry of raw) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof (entry as NavItem).title !== "string" ||
      typeof (entry as NavItem).path !== "string"
    ) {
      console.warn(
        `[book.config.yaml] navigation.${lang}: dropping flat entry missing title/path: ${JSON.stringify(entry)}`,
      );
      continue;
    }
    flat.push(entry as NavItem);
  }
  const groups: NavGroup[] =
    flat.length > 0 ? [{ category: "", items: flat }] : [];
  return { flat, groups };
}

/**
 * Read `book.config.yaml` from the language-source root and return both the
 * normalized title (used everywhere except the PDF cover) and the original
 * multi-line title (used by the PDF cover renderer).
 */
export function loadBookConfig(srcDir: string): NormalizedBookConfig {
  const configPath = path.join(srcDir, "book.config.yaml");
  const raw = parseYaml(fs.readFileSync(configPath, "utf-8")) as RawBookConfig;

  const titleMultiline = (raw.title ?? "").trimEnd();
  const title = normalizeTitle(titleMultiline);

  const navigation: Record<string, NavItem[]> = {};
  const navigationGroups: Record<string, NavGroup[]> = {};
  const rawNav = raw.navigation ?? {};
  for (const [lang, value] of Object.entries(rawNav)) {
    const { flat, groups } = normalizePerLangNavigation(lang, value);
    navigation[lang] = flat;
    navigationGroups[lang] = groups;
  }

  return {
    title,
    titleMultiline,
    description: raw.description ?? "",
    languages: raw.languages ?? [],
    navigation,
    navigationGroups,
  };
}
