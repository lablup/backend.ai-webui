/**
 * Shiki integration (F4 — code-block syntax highlighting).
 *
 * Build-time only — no runtime highlighter is shipped. Each unique
 * `(theme, lang, source)` triple is tokenized once via the bundled Shiki
 * grammars and cached in-memory across the build, so large doc sets with
 * repeating snippets don't re-tokenize the same content.
 *
 * The highlighter is created lazily and shared across all chapters of all
 * languages within a single build invocation. Shiki ships its grammars as
 * JSON in the package — no CDN, no network. Air-gapped friendly.
 *
 * Future dark-mode work (out of scope for F4) can extend this to call
 * `codeToHtml(code, { themes: { light, dark } })` instead of the single
 * `theme` form. The cache key shape is already a tuple-style string so
 * adding a `dark` segment is a one-line change.
 */

import crypto from "crypto";
import { createHighlighter, bundledLanguages, bundledThemes } from "shiki";
import type { Highlighter, BundledLanguage, BundledTheme } from "shiki";
import { escapeHtml } from "./markdown-extensions.js";

export interface ShikiHighlightOptions {
  /** Source code (already de-indented; trailing newline trimmed by caller). */
  code: string;
  /** Language hint from the fenced block (`\`\`\`python`). Empty for unspecified. */
  lang: string;
  /** Light theme name (validated against bundledThemes; defaults applied). */
  theme: string;
}

export interface ShikiHighlightResult {
  /**
   * Inner HTML for `<code>`: a sequence of `<span class="line">` rows whose
   * spans carry inline `style="color:#…"` from Shiki's tokenizer. The caller
   * wraps this in `<pre><code class="language-…">…</code></pre>`.
   *
   * Shiki's `codeToHtml` returns the full `<pre>` wrapper with theme bg etc;
   * we strip that down to just the inner content so the docs-toolkit's own
   * code-block frame (with optional title bar, line-highlight overlay, and
   * the F4 Copy button wrapper) stays in control of presentation.
   */
  innerHtml: string;
  /** True iff Shiki actually highlighted (resolved language was non-text). */
  highlighted: boolean;
  /** Resolved language ("plaintext" if input was unknown). */
  resolvedLang: string;
}

/* ── Lazy highlighter + tokenization cache ───────────────────────────── */

interface HighlighterEntry {
  highlighter: Highlighter;
  loadedThemes: Set<string>;
  loadedLangs: Set<string>;
}

let entryPromise: Promise<HighlighterEntry> | null = null;

/**
 * Tokenization cache. Keyed by `${theme}\0${lang}\0${sha1(code)}`.
 *
 * Cache lifetime is the duration of a single build invocation. The Node
 * process exits after `build:web` completes, so the cache naturally
 * resets between runs. We do not persist to disk in v1 — Shiki's
 * tokenization is fast enough on second-and-later runs of the same
 * build that an in-memory cache covers the spec's "build wall-clock
 * per language ≤ +50%" budget.
 */
const tokenCache = new Map<string, ShikiHighlightResult>();

/**
 * Initialize the Shiki highlighter once per process. Subsequent calls return
 * the same instance. Themes and languages are loaded on demand — we start
 * with the default light theme and let `highlight()` register more if the
 * config asks for them.
 */
async function getEntry(initialTheme: string): Promise<HighlighterEntry> {
  if (entryPromise) return entryPromise;
  entryPromise = (async () => {
    const themeName = resolveTheme(initialTheme);
    const highlighter = await createHighlighter({
      themes: [themeName],
      langs: [],
    });
    return {
      highlighter,
      loadedThemes: new Set([themeName]),
      loadedLangs: new Set<string>(),
    };
  })();
  return entryPromise;
}

/**
 * Validate a theme name against Shiki's bundled themes. Unknown theme names
 * fall back to `github-light` with a one-time console warning so a typo in
 * config doesn't silently swap to a wildly different palette.
 */
const warnedThemes = new Set<string>();
function resolveTheme(name: string): BundledTheme {
  if (name in bundledThemes) return name as BundledTheme;
  if (!warnedThemes.has(name)) {
    warnedThemes.add(name);
    console.warn(
      `[shiki] Unknown theme "${name}". Falling back to "github-light". ` +
        `See https://shiki.style/themes for available themes.`,
    );
  }
  return "github-light";
}

/**
 * Resolve a language alias to a bundled grammar. Returns `null` for unknown
 * languages (caller renders as plain escaped text). Empty input → null.
 */
function resolveLang(lang: string): BundledLanguage | null {
  if (!lang) return null;
  const normalized = lang.toLowerCase();
  if (normalized in bundledLanguages) return normalized as BundledLanguage;
  return null;
}

/**
 * Tokenize `code` with Shiki and return inner HTML for the `<code>` element.
 * Caches by (theme, lang, sha1(code)) so identical blocks across pages /
 * languages tokenize once.
 *
 * On any Shiki error (corrupt grammar, OOM, etc.), falls back to plain
 * escaped HTML so the build never fails because of a code block.
 */
export async function highlight(
  options: ShikiHighlightOptions,
): Promise<ShikiHighlightResult> {
  const { code, lang, theme } = options;
  const themeName = resolveTheme(theme);
  const langName = resolveLang(lang);

  const cacheKey =
    themeName +
    "\0" +
    (langName ?? "plaintext") +
    "\0" +
    crypto.createHash("sha1").update(code).digest("hex");

  const cached = tokenCache.get(cacheKey);
  if (cached) return cached;

  if (!langName) {
    /* No grammar — fall through to escaped plaintext. We still cache so the
     * lookup stays O(1) even when the doc set has hundreds of unspecified
     * fenced blocks (e.g. shell session transcripts without a hint). */
    const result: ShikiHighlightResult = {
      innerHtml: escapeAsLines(code),
      highlighted: false,
      resolvedLang: "plaintext",
    };
    tokenCache.set(cacheKey, result);
    return result;
  }

  const entry = await getEntry(themeName);

  if (!entry.loadedThemes.has(themeName)) {
    await entry.highlighter.loadTheme(themeName);
    entry.loadedThemes.add(themeName);
  }
  if (!entry.loadedLangs.has(langName)) {
    await entry.highlighter.loadLanguage(langName);
    entry.loadedLangs.add(langName);
  }

  let inner: string;
  try {
    const fullHtml = entry.highlighter.codeToHtml(code, {
      lang: langName,
      theme: themeName,
    });
    inner = extractInner(fullHtml);
  } catch (err) {
    /* Defensive: never let a single bad code block break the build. */
    console.warn(
      `[shiki] Failed to highlight ${langName} block (${err instanceof Error ? err.message : String(err)}). Falling back to plain text.`,
    );
    const result: ShikiHighlightResult = {
      innerHtml: escapeAsLines(code),
      highlighted: false,
      resolvedLang: langName,
    };
    tokenCache.set(cacheKey, result);
    return result;
  }

  const result: ShikiHighlightResult = {
    innerHtml: inner,
    highlighted: true,
    resolvedLang: langName,
  };
  tokenCache.set(cacheKey, result);
  return result;
}

/**
 * Strip Shiki's `<pre>` and `<code>` wrappers, returning only the inner
 * `<span class="line">…` content. This lets the docs-toolkit own the outer
 * frame (so existing `.code-block-wrapper` / `.code-block-title` markup and
 * the F4 Copy button wrapper continue to apply uniformly).
 */
function extractInner(shikiHtml: string): string {
  /* Shiki's output: `<pre class="shiki ..." style="..."><code>…</code></pre>`.
   * The regex below tolerates attribute order changes between Shiki versions
   * (no positional assumptions beyond the open/close tags). */
  const codeOpen = shikiHtml.indexOf("<code");
  const codeOpenEnd = codeOpen >= 0 ? shikiHtml.indexOf(">", codeOpen) : -1;
  const codeClose = shikiHtml.lastIndexOf("</code>");
  if (codeOpen < 0 || codeOpenEnd < 0 || codeClose < 0) return shikiHtml;
  return shikiHtml.slice(codeOpenEnd + 1, codeClose);
}

/**
 * Plain-text fallback (no grammar / Shiki error). Wraps each line in
 * `<span class="line">` so the line-highlight overlay (F4 keeps the existing
 * data-highlight feature working on top of Shiki output) can attach by
 * `nth-child` if a future bucket needs it.
 *
 * The legacy renderer wrapped lines in `<span class="code-line">` only when
 * `data-highlight` was present; here we always emit `<span class="line">`
 * for shape consistency with Shiki's output.
 */
function escapeAsLines(code: string): string {
  if (code === "") return '<span class="line"></span>';
  return code
    .split("\n")
    .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
    .join("\n");
}

/** Cache stats — for build summary / debug. */
export function getHighlightCacheStats(): { hits: number; size: number } {
  /* `hits` is not tracked granularly to keep the hot path branch-free; the
   * size of the map is a useful proxy for "distinct code blocks tokenized". */
  return { hits: 0, size: tokenCache.size };
}

/**
 * Reset the cache and clear the cached highlighter. Test-only; the
 * production build path doesn't call this — the cache lives for the
 * duration of the Node process.
 */
export function _resetForTests(): void {
  tokenCache.clear();
  entryPromise = null;
  warnedThemes.clear();
}
