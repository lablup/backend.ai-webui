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
 * Callers that need the layout-friendly multi-line form (currently only the
 * PDF cover renderer) should opt into `titleMultiline`. Everything else
 * should use `title`.
 */

import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";

/**
 * Raw shape of `book.config.yaml`. Kept intentionally minimal — pipelines
 * that care about extra fields cast through `Record<string, unknown>` from
 * the same parsed object.
 */
export interface RawBookConfig {
  title: string;
  description?: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

/**
 * Normalized book config used by the build pipelines.
 *
 * `titleMultiline` always equals the raw value (post-`trim`, with newlines
 * preserved) so pipelines that need the visual line breaks have a stable
 * field to read. `title` is always single-line.
 */
export interface NormalizedBookConfig {
  /** Single-line, whitespace-collapsed. Safe for `<title>` and headers. */
  title: string;
  /** Raw multi-line form. Use only where line breaks are part of the design. */
  titleMultiline: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

/**
 * Collapse runs of whitespace (including newlines) into a single space and
 * trim the result. Idempotent — calling twice gives the same output.
 */
export function normalizeTitle(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
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

  return {
    title,
    titleMultiline,
    description: raw.description ?? "",
    languages: raw.languages ?? [],
    navigation: raw.navigation ?? {},
  };
}
