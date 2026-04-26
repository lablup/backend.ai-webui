/**
 * Website build orchestrator.
 * Reads markdown files, processes them into multi-page HTML, copies assets,
 * and writes output to the dist directory.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { parse as parseYaml } from "yaml";
import { processMarkdownFilesForWeb } from "./markdown-processor-web.js";
import type { LinkDiagnostic } from "./markdown-processor-web.js";
import { slugify } from "./markdown-processor.js";
import {
  buildWebPage,
  buildIndexPage,
  applyImageAttributes,
} from "./website-builder.js";
import { buildSearchIndex } from "./search-index-builder.js";
import type {
  PageAssets,
  PageVersionContext,
  WebsiteMetadata,
} from "./website-builder.js";
import { generateWebsiteStyles } from "./styles-web.js";
import { getDocVersion } from "./version.js";
import type { ResolvedDocConfig } from "./config.js";
import { writeHashedAsset, type AssetManifest } from "./asset-hasher.js";
import { readImageDimensions } from "./image-meta.js";
import {
  loadVersions,
  resolveVersionSource,
  VersionPageRegistry,
  type LoadedVersions,
  type Version,
  type PageEnumerationRow,
} from "./versions.js";

interface BookConfig {
  title: string;
  description: string;
  languages: string[];
  navigation: Record<string, Array<{ title: string; path: string }>>;
}

export interface GenerateWebsiteOptions {
  lang: string;
  /**
   * When true (the default for production `build:web`), broken links and
   * missing-image diagnostics cause the build to exit with a non-zero
   * status. When false, diagnostics are still printed but the build
   * succeeds — used by preview / dev paths to preserve the legacy
   * warning-only behavior.
   */
  strict: boolean;
}

/** Source paths for site-root brand assets. Resolved relative to the toolkit
 * package's bundled assets directory unless overridden. */
interface BrandAssetSources {
  faviconPath: string | null;
  appleTouchIconPath: string | null;
}

/** Resolve packaged brand asset sources from `templates/site-assets/`. */
function resolveBrandAssetSources(): BrandAssetSources {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const templatesDir = path.resolve(here, "..", "templates");
  const faviconPath = path.join(templatesDir, "site-assets", "favicon.ico");
  const appleTouchPath = path.join(
    templatesDir,
    "site-assets",
    "apple-touch-icon.png",
  );
  return {
    faviconPath: fs.existsSync(faviconPath) ? faviconPath : null,
    appleTouchIconPath: fs.existsSync(appleTouchPath) ? appleTouchPath : null,
  };
}

/** Locate the standalone client search.js template shipped with the toolkit. */
function resolveSearchScriptPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "..", "templates", "assets", "search.js");
}

/** Locale format map for date display */
const DATE_LOCALES: Record<string, string> = {
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  th: "th-TH",
};

/**
 * Collect last-modified dates for a list of file paths using git log.
 * Falls back to fs.statSync mtime when git is unavailable.
 */
function collectLastModifiedDates(
  filePaths: string[],
  srcDir: string,
): Map<string, Date> {
  const dates = new Map<string, Date>();

  for (const filePath of filePaths) {
    const fullPath = path.resolve(srcDir, filePath);
    try {
      const gitDate = execFileSync(
        "git",
        ["log", "-1", "--format=%aI", "--", fullPath],
        { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
      ).trim();
      if (gitDate) {
        dates.set(filePath, new Date(gitDate));
        continue;
      }
    } catch {
      // git not available or file not tracked
    }

    // Fallback: file system mtime
    try {
      const stat = fs.statSync(fullPath);
      dates.set(filePath, stat.mtime);
    } catch {
      // file not found
    }
  }

  return dates;
}

/**
 * Format a date for display in the specified locale.
 */
function formatDate(date: Date, lang: string): string {
  const locale = DATE_LOCALES[lang] ?? "en-US";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Rewrite server-absolute image paths to page-relative paths.
 * The web markdown processor produces paths like `/images/foo.png`.
 * For static pages at `{lang}/slug.html`, images at `{lang}/images/foo.png`,
 * we need `./images/foo.png`.
 */
function rewriteImagePathsForStaticSite(html: string): string {
  return html.replace(
    /(src|href)="\/([^"]+\.(?:png|jpe?g|gif|svg|webp))"/gi,
    (_match, attr, imgPath) => {
      return `${attr}="./${imgPath}"`;
    },
  );
}

/**
 * Result returned by a build run. F2 (sitemap + canonical) consumes
 * `pages` to enumerate all (version, lang, slug) triples emitted by
 * the build. `pages` is empty in flat (non-versioned) mode for
 * backward compatibility — F2 will compute equivalent rows from
 * `bookConfig.languages` × `navigation[lang]` in that case.
 */
export interface GenerateWebsiteResult {
  /**
   * True when the build ran in versioned mode (per-version subdirs).
   * False for legacy flat layout.
   */
  versioned: boolean;
  /** All pages emitted by this build (one row per version × lang × slug). */
  pages: PageEnumerationRow[];
  /** Flat list of versions actually built (skipped versions are excluded). */
  versionsBuilt: Version[];
}

/**
 * Generate a static website from documentation sources.
 *
 * Two output layouts are supported:
 *   - Flat (default, no `versions` in config):    `dist/web/<lang>/<slug>.html`
 *   - Versioned (`versions` declared in config):  `dist/web/<v>/<lang>/<slug>.html`
 *
 * In versioned mode, each version directory is a self-contained site
 * with its own search index, sidebar scope, and per-page version
 * selector. The version selector lets readers jump to the same slug in
 * a different version (or that version's index if the slug doesn't
 * exist there). Past minors typically come from `kind: 'archive-branch'`
 * sources; this PR ships the schema + workspace path end-to-end and
 * leaves archive-branch consumption as a warn-and-skip path until the
 * operational rollout materializes the archive worktrees.
 */
export async function generateWebsite(
  config: ResolvedDocConfig,
  options?: Partial<GenerateWebsiteOptions>,
): Promise<GenerateWebsiteResult> {
  const configPath = path.join(config.srcDir, "book.config.yaml");
  const bookConfig: BookConfig = parseYaml(
    fs.readFileSync(configPath, "utf-8"),
  );

  const { display: version } = getDocVersion(
    config.versionSource,
    config.version,
  );
  const title = bookConfig.title;
  const availableLanguages = bookConfig.languages;
  const websiteOutDir = config.website?.outDir ?? "web";
  // Default ON for production builds; CLI flips this off when --no-strict is given.
  const strict = options?.strict ?? true;

  const langArg = options?.lang ?? "all";
  const languages = langArg === "all" ? availableLanguages : [langArg];

  // Validate requested languages
  for (const lang of languages) {
    if (!availableLanguages.includes(lang)) {
      console.error(
        `Language "${lang}" not found in config. Available: ${availableLanguages.join(", ")}`,
      );
      process.exit(1);
    }
  }

  const productName = config.productName;
  // Resolve versioned-docs config. `enabled === false` means flat layout.
  const loadedVersions = loadVersions(config);

  console.log(`${productName} Website Generator`);
  console.log(`Title: ${title}`);
  console.log(`Version: ${version}`);
  console.log(`Languages: ${languages.join(", ")}`);
  console.log(
    `Strict: ${strict ? "on (broken links fail the build)" : "off (warnings only)"}`,
  );
  if (loadedVersions.enabled) {
    console.log(
      `Versions: ${loadedVersions.entries.map((v) => v.label + (v.isLatest ? " (latest)" : "")).join(", ")}`,
    );
  } else {
    console.log("Versions: (single-version flat layout)");
  }
  console.log("");

  // Create shared assets directory and write CSS / search.js with content hashes.
  // Site-shared assets live at `dist/web/assets/` regardless of layout, so
  // the same hashed file is referenced by every version × every language
  // (cheap deploy, single CDN cache key per asset).
  const distBase = path.join(config.distDir, websiteOutDir);
  const assetsDir = path.join(distBase, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  const assetManifest: AssetManifest = {};

  // styles.css → styles.{hash}.css
  const cssContent = generateWebsiteStyles();
  const stylesName = writeHashedAsset(
    assetsDir,
    "styles.css",
    cssContent,
    assetManifest,
  );
  console.log(`Written: assets/${stylesName}`);

  // search.js → search.{hash}.js (single shared file across all languages)
  const searchScriptPath = resolveSearchScriptPath();
  if (!fs.existsSync(searchScriptPath)) {
    throw new Error(
      `Bundled search.js not found at ${searchScriptPath}. ` +
        `Reinstall backend.ai-docs-toolkit or include templates/assets/search.js.`,
    );
  }
  const searchScriptBytes = fs.readFileSync(searchScriptPath);
  const searchName = writeHashedAsset(
    assetsDir,
    "search.js",
    searchScriptBytes,
    assetManifest,
  );
  console.log(`Written: assets/${searchName}`);

  // Optional code-copy.js (added by F4). Pipeline is structured so adding the
  // template is a one-line change once that bucket lands.
  const codeCopyPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "templates",
    "assets",
    "code-copy.js",
  );
  if (fs.existsSync(codeCopyPath)) {
    const bytes = fs.readFileSync(codeCopyPath);
    const codeCopyName = writeHashedAsset(
      assetsDir,
      "code-copy.js",
      bytes,
      assetManifest,
    );
    console.log(`Written: assets/${codeCopyName}`);
  }

  // Site-root brand assets (favicon, apple-touch-icon, site.webmanifest).
  // These live at `dist/web/` (not under `assets/`) so absolute references
  // like `/favicon.ico` work for any deployment layout.
  const rootAssets = writeRootBrandAssets(distBase, title, productName);

  // Aggregate counters used for the post-build summary / strict gate.
  const allDiagnostics: LinkDiagnostic[] = [];
  const imageStats = { total: 0, withDims: 0 };

  // Track every (version, lang, slug) row this build emits. F2 (sitemap +
  // canonical) reads this list to enumerate URLs.
  const pageRegistry = new VersionPageRegistry();
  const versionsBuilt: Version[] = [];

  // Per-page asset manifest is identical for every page in every layout.
  const pageAssets: PageAssets = {
    styles: assetManifest["styles.css"],
    search: assetManifest["search.js"],
    codeCopy: assetManifest["code-copy.js"],
    favicon: rootAssets.favicon,
    appleTouchIcon: rootAssets.appleTouchIcon,
    webmanifest: rootAssets.webmanifest,
  };

  if (loadedVersions.enabled) {
    // Versioned mode — iterate over each declared version.
    // Past minors that fail to resolve their archive-branch worktree are
    // logged and skipped (see resolveVersionSource); the build does NOT
    // hard-fail until the archive infrastructure is materialized.
    for (const v of loadedVersions.entries) {
      const resolved = resolveVersionSource(config, v);
      if (!resolved.ok || !resolved.rootDir) {
        console.warn(
          `[${v.label}] ${resolved.warning ?? "skipped (unresolved source)"}`,
        );
        continue;
      }
      const versionRoot = resolved.rootDir;
      // For archive-branch sources, srcDir/distDir are reinterpreted
      // relative to the archive's worktree root. For workspace sources,
      // we reuse the resolved config as-is.
      const versionConfig: ResolvedDocConfig =
        v.source.kind === "workspace"
          ? config
          : {
              ...config,
              projectRoot: versionRoot,
              srcDir: path.join(versionRoot, "src"),
            };
      const versionBookConfigPath = path.join(
        versionConfig.srcDir,
        "book.config.yaml",
      );
      const versionBookConfig: BookConfig = parseYaml(
        fs.readFileSync(versionBookConfigPath, "utf-8"),
      );

      console.log(`=== Version ${v.label}${v.isLatest ? " (latest)" : ""} ===`);
      const versionDir = path.join(distBase, v.outDir);
      fs.mkdirSync(versionDir, { recursive: true });

      for (const lang of languages) {
        if (!versionBookConfig.languages.includes(lang)) {
          console.warn(
            `[${v.label}/${lang}] not in this version's book.config.yaml, skipping`,
          );
          continue;
        }
        await buildLanguage({
          lang,
          version,
          title: versionBookConfig.title,
          config: versionConfig,
          bookConfig: versionBookConfig,
          outRoot: versionDir,
          rootDepth: 3,
          versionLabel: v.label,
          loadedVersions,
          pageAssets,
          assetManifest,
          allDiagnostics,
          imageStats,
          pageRegistry,
        });
      }

      versionsBuilt.push(v);
    }

    // Root index → redirect to latest version's default lang (en if available).
    if (loadedVersions.latest) {
      writeRootRedirectIndex(distBase, loadedVersions.latest, languages);
    }
  } else {
    // Flat (legacy / single-version) mode — preserves FR-2159 behavior.
    for (const lang of languages) {
      await buildLanguage({
        lang,
        version,
        title,
        config,
        bookConfig,
        outRoot: distBase,
        rootDepth: 2,
        versionLabel: null,
        loadedVersions,
        pageAssets,
        assetManifest,
        allDiagnostics,
        imageStats,
        pageRegistry,
      });
    }
  }

  // Image-attribute coverage report (loading/decoding are 100% via post-
  // processing; width/height depends on parsed PNG headers).
  if (imageStats.total > 0) {
    const dimPct = ((imageStats.withDims / imageStats.total) * 100).toFixed(1);
    console.log(
      `Images: ${imageStats.total} total — width/height present on ${imageStats.withDims} (${dimPct}%); loading/decoding present on all.`,
    );
  }

  // Strict-mode gate: any broken-link / ambiguous-link diagnostic fails the build.
  const broken = allDiagnostics.filter(
    (d) => d.type === "broken-link" || d.type === "ambiguous-link",
  );
  if (strict && broken.length > 0) {
    console.error("");
    console.error(
      `Strict mode: build failed — ${broken.length} broken / ambiguous link diagnostic(s).`,
    );
    console.error("Re-run without --strict to allow warnings to pass.");
    process.exit(1);
  }

  console.log(`Website generated at: ${distBase}`);

  return {
    versioned: loadedVersions.enabled,
    pages: [...pageRegistry.enumerateAll()],
    versionsBuilt,
  };
}

/**
 * Per-language build step shared by both flat and versioned modes.
 *
 * `outRoot` is the directory that contains `<lang>/...` subdirs:
 *   - Flat:      `dist/web/`            → page at `dist/web/<lang>/foo.html`  (rootDepth = 2)
 *   - Versioned: `dist/web/<v>/`        → page at `dist/web/<v>/<lang>/foo.html` (rootDepth = 3)
 *
 * `versionLabel` is null in flat mode, otherwise the minor label like "25.16".
 * The version selector header is only emitted when `versionLabel !== null`.
 */
async function buildLanguage(args: {
  lang: string;
  version: string;
  title: string;
  config: ResolvedDocConfig;
  bookConfig: BookConfig;
  outRoot: string;
  rootDepth: 2 | 3;
  versionLabel: string | null;
  loadedVersions: LoadedVersions;
  pageAssets: PageAssets;
  assetManifest: AssetManifest;
  allDiagnostics: LinkDiagnostic[];
  imageStats: { total: number; withDims: number };
  pageRegistry: VersionPageRegistry;
}): Promise<void> {
  const {
    lang,
    version,
    title,
    config,
    bookConfig,
    outRoot,
    rootDepth,
    versionLabel,
    loadedVersions,
    pageAssets,
    allDiagnostics,
    imageStats,
    pageRegistry,
  } = args;

  const startTime = Date.now();
  const labelPrefix = versionLabel ? `[${versionLabel}/${lang}]` : `[${lang}]`;
  console.log(`${labelPrefix} Building website...`);

  const navigation = bookConfig.navigation[lang];
  if (!navigation) {
    console.warn(`${labelPrefix} No navigation found, skipping`);
    return;
  }

  // Create language output directory
  const langDir = path.join(outRoot, lang);
  fs.mkdirSync(langDir, { recursive: true });

  // Process markdown files (multi-page mode)
  console.log(`${labelPrefix} Processing ${navigation.length} chapters...`);
  const langDiagnostics: LinkDiagnostic[] = [];
  const chapters = await processMarkdownFilesForWeb(
    lang,
    navigation,
    config.srcDir,
    version,
    config,
    { multiPage: true, diagnosticsSink: langDiagnostics },
  );
  for (const d of langDiagnostics) allDiagnostics.push(d);

  const metadata: WebsiteMetadata = { title, version, lang };

  // Collect last-modified dates for all navigation files
  const navFilePaths = navigation.map((nav) => path.join(lang, nav.path));
  const lastModifiedDates = collectLastModifiedDates(
    navFilePaths,
    config.srcDir,
  );

  // Pre-resolve image dimensions for this language's images (best-effort).
  const srcImagesDir = path.join(config.srcDir, lang, "images");
  const imageDims = collectImageDimensions(srcImagesDir);

  // Compute per-version slug availability ONCE per language. The same
  // slug-availability map is reused for every page in this language —
  // it depends only on (currentVersion, lang, slug), and within a
  // language the answer is "is this slug in version X's nav?"
  const allSlugsThisLang = new Set(
    chapters.map((c) => c.slug).filter((s): s is string => !!s),
  );

  // Pre-record this build's pages into the cross-version registry. We
  // do it BEFORE rendering so the version-switcher availability map
  // (which uses the registry transitively only for the *current* slug)
  // remains correct in the common case where versions share slugs.
  // See note on the `availability` field below.
  for (const slug of allSlugsThisLang) {
    pageRegistry.record({
      version: versionLabel ?? "",
      lang,
      slug,
      path:
        versionLabel !== null
          ? `${versionLabel}/${lang}/${slug}.html`
          : `${lang}/${slug}.html`,
      isLatest:
        versionLabel === null
          ? true
          : versionLabel === loadedVersions.latest?.label,
    });
  }

  // Generate individual HTML pages
  console.log(`${labelPrefix} Generating ${chapters.length} pages...`);
  for (let i = 0; i < chapters.length; i++) {
    const navEntry = navigation.find(
      (n) => slugify(n.title) === chapters[i].slug,
    );
    if (!navEntry) {
      console.warn(
        `${labelPrefix} No navigation entry found for chapter slug "${chapters[i].slug}"`,
      );
    }
    const navFilePath = navEntry ? path.join(lang, navEntry.path) : undefined;
    const lastDate = navFilePath
      ? lastModifiedDates.get(navFilePath)
      : undefined;

    const versionContext = buildPageVersionContext({
      loadedVersions,
      versionLabel,
      slug: chapters[i].slug,
      rootDepth,
      pageRegistry,
    });

    let pageHtml = buildWebPage({
      chapter: chapters[i],
      allChapters: chapters,
      currentIndex: i,
      metadata,
      config,
      navPath: navEntry?.path,
      lastUpdated: lastDate ? formatDate(lastDate, lang) : undefined,
      assets: pageAssets,
      versionContext,
    });

    // Fix image paths for static site (./images/foo.png).
    pageHtml = rewriteImagePathsForStaticSite(pageHtml);

    // Apply lazy/async/width/height to every <img> after path rewriting,
    // so dimension lookup keys (`./images/x.png`) match the final HTML.
    pageHtml = applyImageAttributes(pageHtml, imageDims);

    // Track image-attribute coverage for the post-build report.
    const imgStatsForPage = countImageAttrs(pageHtml);
    imageStats.total += imgStatsForPage.total;
    imageStats.withDims += imgStatsForPage.withDims;

    const outputPath = path.join(langDir, `${chapters[i].slug}.html`);
    fs.writeFileSync(outputPath, pageHtml, "utf-8");
  }

  // Generate index.html (redirect to first page, or placeholder if no chapters)
  const indexHtml =
    chapters.length === 0
      ? `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /><title>${title}</title></head>
<body><h1>${title}</h1><p>No documentation content was generated for this language.</p></body>
</html>`
      : buildIndexPage(chapters, metadata);
  fs.writeFileSync(path.join(langDir, "index.html"), indexHtml, "utf-8");

  // Build search index — partitioned per (version × lang) so search
  // results never leak across versions.
  const searchIndex = buildSearchIndex(chapters, lang);
  const searchIndexJson = JSON.stringify(searchIndex);
  fs.writeFileSync(
    path.join(langDir, "search-index.json"),
    searchIndexJson,
    "utf-8",
  );
  const indexSizeKb = (Buffer.byteLength(searchIndexJson) / 1024).toFixed(0);
  console.log(
    `${labelPrefix} Search index: ${Object.keys(searchIndex.index).length} terms (${indexSizeKb} KB)`,
  );

  // Copy images
  const destImagesDir = path.join(langDir, "images");
  if (fs.existsSync(srcImagesDir)) {
    fs.mkdirSync(destImagesDir, { recursive: true });
    const imageFiles = fs.readdirSync(srcImagesDir);
    let imageCount = 0;
    for (const file of imageFiles) {
      const srcPath = path.join(srcImagesDir, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, path.join(destImagesDir, file));
        imageCount++;
      }
    }
    console.log(`${labelPrefix} Copied ${imageCount} images`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `${labelPrefix} Done: ${chapters.length} pages generated (${elapsed}s)`,
  );
  console.log("");
}

/**
 * Build the per-page version context for the version selector. Returns
 * `undefined` in flat (non-versioned) mode so the header bar suppresses
 * the dropdown.
 *
 * `availability` is computed from the cross-version page registry. As
 * the build processes versions in declared order, the registry grows
 * monotonically — by the time we render a page, all versions earlier
 * in the iteration order have been recorded. Versions iterated AFTER
 * the current one have not been recorded yet, so we conservatively
 * treat their availability as "true if equal to current version, else
 * unknown → fall back to index". This is safe: a wrong-but-conservative
 * availability map only causes the switcher to land on the index page
 * once instead of jumping to the same slug. The acceptance criteria
 * explicitly allow that fallback.
 *
 * To make the common case (slug exists in every version) work cleanly,
 * we ALSO mark every other declared version's availability as `true`
 * by default. The fallback to index happens at navigation time on the
 * client when the target page returns 404 (browser-handled). We don't
 * have a perfect server-side enumeration of every version's slug list
 * because past minors come from archive branches that might not be
 * checked out. The approximation is documented in ARCHITECTURE.md.
 */
function buildPageVersionContext(args: {
  loadedVersions: LoadedVersions;
  versionLabel: string | null;
  slug: string;
  rootDepth: 2 | 3;
  pageRegistry: VersionPageRegistry;
}): PageVersionContext | undefined {
  const { loadedVersions, versionLabel, slug, rootDepth, pageRegistry } = args;
  if (!loadedVersions.enabled || !versionLabel || !loadedVersions.latest) {
    return undefined;
  }
  const allLabels = loadedVersions.entries.map((v) => v.label);
  const slugAvailability: Record<string, boolean> = {};
  for (const v of loadedVersions.entries) {
    if (v.label === versionLabel) {
      // Always available: the page is being rendered right now in this version.
      slugAvailability[v.label] = true;
      continue;
    }
    // For OTHER versions: trust the registry's answer. If the slug is
    // present, the version switcher links directly to the same slug in
    // the target version. If absent (slug doesn't exist there, or the
    // archive branch didn't materialize), the inline switcher script
    // reads `data-availability` and falls back to that version's index
    // page — avoiding a real 404 that would violate the F6 acceptance
    // criterion. See ARCHITECTURE.md → "Header version selector".
    slugAvailability[v.label] = pageRegistry.hasSlug(v.label, slug);
  }
  return {
    current: versionLabel,
    allLabels,
    latest: loadedVersions.latest.label,
    slugAvailability,
    slug,
    rootDepth,
  };
}

/**
 * Write a tiny `dist/web/index.html` that redirects to the latest
 * version's default-language landing page. F1 (root language picker)
 * may later replace this with a richer entry; in the meantime a
 * meta-refresh keeps `dist/web/` from 404ing in versioned mode.
 */
function writeRootRedirectIndex(
  distBase: string,
  latest: Version,
  builtLanguages: string[],
): void {
  // Prefer English when present, otherwise the first built language.
  const targetLang = builtLanguages.includes("en") ? "en" : builtLanguages[0];
  if (!targetLang) return;
  const target = `./${latest.label}/${targetLang}/index.html`;
  const html = `<!DOCTYPE html>
<html lang="${targetLang}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <title>Backend.AI Docs</title>
</head>
<body>
  <p>Redirecting to <a href="${target}">latest version</a>…</p>
</body>
</html>`;
  fs.writeFileSync(path.join(distBase, "index.html"), html, "utf-8");
  console.log(`Written: index.html → ${target}`);
}

/**
 * Parse PNG IHDR width/height for every file under `srcImagesDir`. The map
 * key matches the URL the page builder emits (`./images/<file>`), so the
 * `<img>` post-processor can look up dimensions in O(1).
 */
function collectImageDimensions(
  srcImagesDir: string,
): Map<string, { width: number; height: number }> {
  const result = new Map<string, { width: number; height: number }>();
  if (!fs.existsSync(srcImagesDir)) return result;

  for (const file of fs.readdirSync(srcImagesDir)) {
    const full = path.join(srcImagesDir, file);
    let stat: fs.Stats;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;
    if (!/\.png$/i.test(file)) continue; // PNG is the only format we parse today
    const dims = readImageDimensions(full);
    if (!dims) continue;
    result.set(`./images/${file}`, dims);
  }
  return result;
}

/**
 * Count `<img>` tags in `html` and how many of them carry `width=`/`height=`.
 * Used purely for the post-build coverage report.
 */
function countImageAttrs(html: string): { total: number; withDims: number } {
  let total = 0;
  let withDims = 0;
  const re = /<img\b[^>]*\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    total++;
    if (/\bwidth\s*=/.test(m[0]) && /\bheight\s*=/.test(m[0])) withDims++;
  }
  return { total, withDims };
}

interface RootBrandAssets {
  favicon?: string;
  appleTouchIcon?: string;
  webmanifest?: string;
}

/**
 * Copy bundled `favicon.ico` / `apple-touch-icon.png` into `dist/web/` and
 * synthesize a basic `site.webmanifest` (no service worker). Filenames are
 * stable (no content hash) so deep links and PWA manifest references stay
 * working across rebuilds.
 *
 * If a brand asset is missing from the toolkit's templates, the corresponding
 * filename is omitted from the returned manifest — pages skip that link tag
 * silently. The build never fails because of a missing brand asset.
 */
function writeRootBrandAssets(
  distBase: string,
  title: string,
  productName: string,
): RootBrandAssets {
  const sources = resolveBrandAssetSources();
  const out: RootBrandAssets = {};

  if (sources.faviconPath) {
    const dest = path.join(distBase, "favicon.ico");
    fs.copyFileSync(sources.faviconPath, dest);
    out.favicon = "favicon.ico";
    console.log(`Written: favicon.ico`);
  }
  if (sources.appleTouchIconPath) {
    const dest = path.join(distBase, "apple-touch-icon.png");
    fs.copyFileSync(sources.appleTouchIconPath, dest);
    out.appleTouchIcon = "apple-touch-icon.png";
    console.log(`Written: apple-touch-icon.png`);
  }

  // Basic web app manifest — no service worker, no install behavior beyond
  // browser defaults. Operators who want richer PWA behavior can replace
  // this file post-build; until then it satisfies the "exists at site root"
  // acceptance criterion.
  const manifest = {
    name: title,
    short_name: productName,
    start_url: "./",
    display: "standalone",
    icons: out.appleTouchIcon
      ? [
          {
            src: "./apple-touch-icon.png",
            sizes: "256x256",
            type: "image/png",
          },
        ]
      : [],
  };
  fs.writeFileSync(
    path.join(distBase, "site.webmanifest"),
    JSON.stringify(manifest, null, 2),
    "utf-8",
  );
  out.webmanifest = "site.webmanifest";
  console.log(`Written: site.webmanifest`);

  return out;
}
