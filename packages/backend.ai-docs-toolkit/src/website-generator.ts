/**
 * Website build orchestrator.
 * Reads markdown files, processes them into multi-page HTML, copies assets,
 * and writes output to the dist directory.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { processMarkdownFilesForWeb } from "./markdown-processor-web.js";
import type { LinkDiagnostic } from "./markdown-processor-web.js";
import {
  RESERVED_HOME_SLUG,
  slugFromNavPath,
} from "./markdown-processor.js";
import {
  buildWebPage,
  buildHomePage,
  buildRootRedirectIndexPage,
  applyImageAttributes,
} from "./website-builder.js";
import { buildSearchIndex } from "./search-index-builder.js";
import type {
  LanguagePeer,
  PageAssets,
  PageSeoContext,
  PageVersionContext,
  WebsiteMetadata,
} from "./website-builder.js";
import { buildSitemapXml } from "./sitemap.js";
import { buildRobotsTxt } from "./robots-txt.js";
import {
  copyUserOgImage,
  renderDefaultOgImage,
  type RenderedOgImage,
} from "./og-image-renderer.js";
import { canonicalPathFor } from "./versions.js";
import { generateWebsiteStyles } from "./styles-web.js";
import { getDocVersion } from "./version.js";
import {
  loadBookConfig,
  type NavGroup,
  type NormalizedBookConfig,
} from "./book-config.js";
import type { ResolvedDocConfig } from "./config.js";
import { writeHashedAsset, type AssetManifest } from "./asset-hasher.js";
import { readImageDimensions } from "./image-meta.js";
import {
  optimizeImage,
  newOptimizeImageStats,
  recordOptimizeStat,
  formatOptimizeSummary,
  rewriteImageTagsToPicture,
  type OptimizeImageStats,
  type ImageVariantInfo,
} from "./image-optimizer.js";
import {
  loadVersions,
  resolveVersionSource,
  VersionPageRegistry,
  type LoadedVersions,
  type Version,
  type PageEnumerationRow,
} from "./versions.js";

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
  /**
   * F5 stretch (FR-2722): when true, every PNG > 50 KB also gets a
   * `.webp` (and optionally `.avif`) variant generated via `sharp`,
   * and `<img>` tags are rewritten to `<picture>` with a PNG fallback.
   * Off by default to keep dev/preview wall-clock unchanged. The flag
   * is plumbed from `--optimize-images` on the CLI.
   */
  optimizeImages?: boolean;
  /**
   * Generate AVIF variants in addition to WebP. Only takes effect when
   * `optimizeImages` is true. Off by default — AVIF encoding is slower
   * and the marginal size win over WebP is small for typical screenshots.
   */
  optimizeImagesAvif?: boolean;
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
  // Single-line `title` is used for `<title>`, sidebar headers, and console
  // output. `book.config.yaml`'s `title: |` block scalar is collapsed at
  // load time so embedded newlines never reach the rendered HTML.
  const bookConfig = loadBookConfig(config.srcDir);

  const { display: version } = getDocVersion(
    config.versionSource,
    config.version,
  );
  const title = bookConfig.title;
  const availableLanguages = bookConfig.languages;
  const websiteOutDir = config.website?.outDir ?? "web";
  // Default ON for production builds; CLI flips this off when --no-strict is given.
  const strict = options?.strict ?? true;
  // F5 stretch (FR-2722): default OFF so dev/preview wall-clock is unchanged.
  const optimizeImages = options?.optimizeImages === true;
  const optimizeImagesAvif = options?.optimizeImagesAvif === true;

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
  if (optimizeImages) {
    console.log(
      `Image optimization: on (PNG > 50 KB → WebP${optimizeImagesAvif ? " + AVIF" : ""})`,
    );
  }
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
  // FR-2726 Phase 1: forward consumer branding (primary color + hover /
  // active / soft variants) to the stylesheet generator. Logo paths and
  // sub-label flow through HTML in later phases, not CSS.
  const cssContent = generateWebsiteStyles({
    primaryColor: config.branding.primaryColor,
    primaryColorHover: config.branding.primaryColorHover,
    primaryColorActive: config.branding.primaryColorActive,
    primaryColorSoft: config.branding.primaryColorSoft,
  });
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

  // FR-2726 Phase 4: BAI interactions (theme toggle, mobile drawer,
  // search palette). Single file so the page only ships one extra
  // script tag. Skipped when the template doesn't exist so older
  // toolkit installs build cleanly.
  const interactionsPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "templates",
    "assets",
    "interactions.js",
  );
  if (fs.existsSync(interactionsPath)) {
    const bytes = fs.readFileSync(interactionsPath);
    const interactionsName = writeHashedAsset(
      assetsDir,
      "interactions.js",
      bytes,
      assetManifest,
    );
    console.log(`Written: assets/${interactionsName}`);
  }

  // Right-rail TOC scroll-spy (F3). Tiny IntersectionObserver script —
  // shipped only when the file exists in templates so a toolkit install
  // without F3 still builds. Page builder also no-ops when the asset is
  // absent, so this is safe regardless.
  const tocScrollspyPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "templates",
    "assets",
    "toc-scrollspy.js",
  );
  if (fs.existsSync(tocScrollspyPath)) {
    const bytes = fs.readFileSync(tocScrollspyPath);
    const tocScrollspyName = writeHashedAsset(
      assetsDir,
      "toc-scrollspy.js",
      bytes,
      assetManifest,
    );
    console.log(`Written: assets/${tocScrollspyName}`);
  }

  // FR-2723: version-banner.js powers the "view latest" banner +
  // "not in selected version" notice. Only emitted in versioned mode
  // — in flat mode there is no versioning UX to drive, so we skip the
  // asset entirely (zero bytes shipped, zero behavior change).
  if (loadedVersions.enabled) {
    const versionBannerPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "templates",
      "assets",
      "version-banner.js",
    );
    if (fs.existsSync(versionBannerPath)) {
      const bytes = fs.readFileSync(versionBannerPath);
      const versionBannerName = writeHashedAsset(
        assetsDir,
        "version-banner.js",
        bytes,
        assetManifest,
      );
      console.log(`Written: assets/${versionBannerName}`);
    } else {
      console.warn(
        "[version-banner] templates/assets/version-banner.js not found — " +
          "version-mismatch UX will not render. Reinstall backend.ai-docs-toolkit " +
          "or restore the template file.",
      );
    }
  }

  // Site-root brand assets (favicon, apple-touch-icon, site.webmanifest).
  // These live at `dist/web/` (not under `assets/`) so absolute references
  // like `/favicon.ico` work for any deployment layout.
  const rootAssets = writeRootBrandAssets(distBase, title, productName);

  // Topbar brand logos (FR-2726 Phase 2). Copied into `assets/` with a
  // content hash so the topbar can reference them via relative URLs that
  // survive deploys to any subpath. Both light and dark are optional;
  // when unconfigured, the topbar renders a text fallback.
  let brandLogoLight: string | undefined;
  let brandLogoDark: string | undefined;
  if (config.branding.logoLight && fs.existsSync(config.branding.logoLight)) {
    const ext = path.extname(config.branding.logoLight) || ".svg";
    const bytes = fs.readFileSync(config.branding.logoLight);
    brandLogoLight = writeHashedAsset(
      assetsDir,
      `brand-logo-light${ext}`,
      bytes,
      assetManifest,
    );
    console.log(`Written: assets/${brandLogoLight}`);
  } else if (config.branding.logoLight) {
    console.warn(
      `[branding] logoLight not found at ${config.branding.logoLight}; topbar will use text fallback.`,
    );
  }
  if (
    config.branding.logoDark &&
    config.branding.logoDark !== config.branding.logoLight &&
    fs.existsSync(config.branding.logoDark)
  ) {
    const ext = path.extname(config.branding.logoDark) || ".svg";
    const bytes = fs.readFileSync(config.branding.logoDark);
    brandLogoDark = writeHashedAsset(
      assetsDir,
      `brand-logo-dark${ext}`,
      bytes,
      assetManifest,
    );
    console.log(`Written: assets/${brandLogoDark}`);
  } else if (
    config.branding.logoDark &&
    config.branding.logoDark === config.branding.logoLight
  ) {
    // Same file — re-use the light variant's hashed name.
    brandLogoDark = brandLogoLight;
  } else if (
    config.branding.logoDark &&
    config.branding.logoDark !== config.branding.logoLight
  ) {
    // Symmetric warning to the logoLight branch above so a missing
    // dark-mode logo is just as easy to spot as a missing light one.
    console.warn(
      `[branding] logoDark not found at ${config.branding.logoDark}; topbar will fall back to the light logo in dark mode.`,
    );
  }

  // Aggregate counters used for the post-build summary / strict gate.
  const allDiagnostics: LinkDiagnostic[] = [];
  const imageStats = { total: 0, withDims: 0 };
  // FR-2722: image optimization stats — only populated when the flag is on.
  const optimizeStats = newOptimizeImageStats();
  // Shared image-optimizer cache lives at the build root so identical
  // PNGs across languages / versions hit the same entry.
  const optimizerCacheDir = path.join(distBase, ".image-optimizer-cache");

  // Track every (version, lang, slug) row this build emits. F2 (sitemap +
  // canonical) reads this list to enumerate URLs.
  const pageRegistry = new VersionPageRegistry();
  const versionsBuilt: Version[] = [];

  // Per-page asset manifest is identical for every page in every layout.
  // `versionBanner` is only present in versioned mode (asset is only
  // written when `loadedVersions.enabled`); flat-mode pages get
  // `undefined`, which the page builder treats as "no script tag".
  const pageAssets: PageAssets = {
    styles: assetManifest["styles.css"],
    search: assetManifest["search.js"],
    codeCopy: assetManifest["code-copy.js"],
    tocScrollspy: assetManifest["toc-scrollspy.js"],
    versionBanner: assetManifest["version-banner.js"],
    interactions: assetManifest["interactions.js"],
    favicon: rootAssets.favicon,
    appleTouchIcon: rootAssets.appleTouchIcon,
    webmanifest: rootAssets.webmanifest,
    brandLogoLight,
    brandLogoDark,
  };

  // ── F2: Default OG image rendering ────────────────────────────
  // Two strategies, in priority order:
  //   1. `og.imagePath` (operator override) — copied verbatim.
  //   2. Default rendering — `manifest/backend.ai-brand-simple.svg`
  //      → 1200×630 PNG via Playwright.
  // Both produce a file under `dist/web/assets/og-default.<ext>`. When
  // both are unavailable (missing file or no Playwright), the OG image
  // tag is dropped per page — no crash, just degraded preview cards.
  const ogImage = await prepareOgImage(config, assetsDir);
  if (ogImage) {
    console.log(`Written: ${ogImage.relUrl}`);
  }

  // ── F2: SEO context skeleton (per-page details filled later) ──
  const ogConfig = config.og ?? {};
  const baseUrl = normalizeBaseUrl(ogConfig.baseUrl);
  if (!baseUrl) {
    console.warn(
      "[seo] og.baseUrl not set in docs-toolkit.config.yaml. " +
        "sitemap.xml will be skipped, canonical URLs will be relative, " +
        'og:url will be omitted. Set `og.baseUrl: "https://..."` to enable.',
    );
  }
  // F2 normalizes multi-line `book.config.yaml` titles before embedding
  // them in `og:site_name` / JSON-LD. F1 will fix the `<title>` tag at
  // its own layer (and may also normalize the value at config-read
  // time), but until F1 lands, F2 must not ship literal newlines in
  // SEO tags — they break Open Graph parsers.
  const siteName = collapseWhitespace(ogConfig.siteName ?? title);
  const publisher = config.pdfMetadata.author ?? config.productName;

  // ── F2: Last-modified timestamps shared across emissions ──────
  // The website generator passes a sink Map down to every per-language
  // step; each step adds its (filePath → Date) pairs. After the build
  // completes, the sitemap emitter consumes the same Map to attach
  // `<lastmod>` per (version, lang, slug) row.
  const lastModSink = new Map<string, Date>();

  // Tracks the languages actually emitted for the latest version, so the
  // root redirect index can offer only languages that exist on the page
  // it redirects into. Otherwise the workspace `book.config.yaml` and
  // the latest archive's `book.config.yaml` could diverge and the
  // picker would 404 a user who happened to prefer the missing
  // language. Populated inside the versioned-mode loop below.
  let latestVersionLanguages: string[] | null = null;

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
      const versionBookConfig = loadBookConfig(versionConfig.srcDir);
      if (v.isLatest) {
        // Intersect with the per-run `languages` filter so a `--lang en`
        // run does not promise other languages on the redirect page.
        latestVersionLanguages = versionBookConfig.languages.filter((l) =>
          languages.includes(l),
        );
      }

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
          seoBase: {
            baseUrl,
            siteName,
            publisher,
            ogImageRelUrl: ogImage?.relUrl,
          },
          lastModSink,
          optimizeImages,
          optimizeImagesAvif,
          optimizeStats,
          optimizerCacheDir,
        });
      }

      versionsBuilt.push(v);
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
        seoBase: {
          baseUrl,
          siteName,
          publisher,
          ogImageRelUrl: ogImage?.relUrl,
        },
        lastModSink,
        optimizeImages,
        optimizeImagesAvif,
        optimizeStats,
        optimizerCacheDir,
      });
    }
  }

  // ── F2: sitemap.xml + robots.txt emission ─────────────────────
  // We only emit sitemap.xml when `og.baseUrl` is set, because a
  // sitemap with relative `<loc>` is non-conformant. robots.txt is
  // always emitted (it's useful even without a sitemap reference).
  if (baseUrl) {
    const sitemapXml = buildSitemapXml({
      pages: pageRegistry.enumerateAll(),
      baseUrl,
      lastModFor: (row) => {
        // F6's path is `<v>/<lang>/<slug>.html` or `<lang>/<slug>.html`.
        // The sink uses the SAME path key, so we can look up directly.
        const date = lastModSink.get(row.path);
        return date ? date.toISOString() : undefined;
      },
    });
    fs.writeFileSync(path.join(distBase, "sitemap.xml"), sitemapXml, "utf-8");
    console.log(
      `Written: sitemap.xml (${pageRegistry.enumerateAll().length} URLs)`,
    );
  } else {
    console.log("Skipped: sitemap.xml (og.baseUrl not configured)");
  }

  const sitemapAbs = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/sitemap.xml`
    : undefined;
  const robotsTxt = buildRobotsTxt({ sitemapUrl: sitemapAbs });
  fs.writeFileSync(path.join(distBase, "robots.txt"), robotsTxt, "utf-8");
  console.log(`Written: robots.txt`);

  // Image-attribute coverage report (loading/decoding are 100% via post-
  // processing; width/height depends on parsed PNG headers).
  if (imageStats.total > 0) {
    const dimPct = ((imageStats.withDims / imageStats.total) * 100).toFixed(1);
    console.log(
      `Images: ${imageStats.total} total — width/height present on ${imageStats.withDims} (${dimPct}%); loading/decoding present on all.`,
    );
  }

  // FR-2722: image optimization summary. Only emitted when the operator
  // opted in with --optimize-images and we actually walked at least one
  // PNG. Cache hits and below-threshold counts are reported here so
  // operators can tune the threshold or invalidate the cache.
  if (optimizeImages) {
    const summary = formatOptimizeSummary(optimizeStats);
    if (summary) console.log(summary);
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

  // Site-root redirect index (FR-2710 F1 / FR-2753). Lives at
  // `dist/web/index.html` and is the only page outside any language (or
  // version) subtree. The redirect script runs in <head> so the page
  // never paints UI before navigating; a `<noscript>` fallback ships
  // working links for clients with JavaScript disabled.
  //
  // In versioned mode (FR-2729) the redirect target is prefixed with the
  // `latest: true` entry's label, so the user lands on a real page
  // instead of `./<lang>/index.html` (which does not exist when output
  // lives at `dist/web/<version>/<lang>/...`). The language list is
  // sourced from the LATEST version's own `book.config.yaml` (filtered
  // by this run's --lang) — not from the workspace root — so it cannot
  // promise a language the latest archive does not actually ship.
  const redirectLanguages =
    loadedVersions.enabled && latestVersionLanguages
      ? latestVersionLanguages
      : languages;
  if (redirectLanguages.length === 0) {
    console.warn(
      "Skipped: index.html (no built languages for the redirect target)",
    );
  } else {
    const peerLangsForRedirect = redirectLanguages.map((peerLang) => ({
      lang: peerLang,
      label: config.languageLabels[peerLang] ?? peerLang,
    }));
    const redirectHtml = buildRootRedirectIndexPage({
      title,
      productName,
      languages: peerLangsForRedirect,
      fallback: redirectLanguages.includes("en")
        ? "en"
        : redirectLanguages[0],
      latestVersion: loadedVersions.latest?.label,
    });
    fs.writeFileSync(path.join(distBase, "index.html"), redirectHtml, "utf-8");
    console.log(
      `Written: index.html (root redirect${loadedVersions.latest ? ` → ${loadedVersions.latest.label}` : ""})`,
    );
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
/**
 * Per-build SEO base context. Built once in `generateWebsite()` and
 * forwarded to every `buildLanguage()` invocation; the per-page
 * `PageSeoContext` is composed on the fly by mixing in pagePath,
 * canonicalPath, and lastModifiedIso.
 */
interface SeoBaseContext {
  baseUrl: string | undefined;
  siteName: string;
  publisher: string;
  ogImageRelUrl: string | undefined;
}

async function buildLanguage(args: {
  lang: string;
  version: string;
  title: string;
  config: ResolvedDocConfig;
  bookConfig: NormalizedBookConfig;
  outRoot: string;
  rootDepth: 2 | 3;
  versionLabel: string | null;
  loadedVersions: LoadedVersions;
  pageAssets: PageAssets;
  assetManifest: AssetManifest;
  allDiagnostics: LinkDiagnostic[];
  imageStats: { total: number; withDims: number };
  pageRegistry: VersionPageRegistry;
  seoBase: SeoBaseContext;
  lastModSink: Map<string, Date>;
  optimizeImages: boolean;
  optimizeImagesAvif: boolean;
  optimizeStats: OptimizeImageStats;
  optimizerCacheDir: string;
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
    seoBase,
    lastModSink,
    optimizeImages,
    optimizeImagesAvif,
    optimizeStats,
    optimizerCacheDir,
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

  const availableLanguages = bookConfig.languages;
  const metadata: WebsiteMetadata = { title, version, lang, availableLanguages };

  // F3: nav groups for the current language. Always present — even legacy
  // flat configs are wrapped in a single anonymous-category group by the
  // loader. Build a path → category map once so per-page breadcrumb
  // resolution is O(1). Empty-string category (anonymous group) means
  // the breadcrumb omits the middle segment for that page.
  const navGroups: NavGroup[] = bookConfig.navigationGroups[lang] ?? [];
  const categoryByPath = new Map<string, string>();
  for (const group of navGroups) {
    for (const item of group.items) {
      categoryByPath.set(item.path, group.category);
    }
  }

  // Per-language nav-path -> slug index. The language switcher (F1) maps
  // `quickstart.md` (path) in the current language to the same path in
  // every peer language, then resolves the peer's slug for the
  // cross-language link target. Paths are stable across languages, and
  // slugs are now derived from those paths (FR-2737), so the join key
  // and the resulting slug are both language-stable. The map is kept
  // (rather than collapsed to a single shared slug map) so future
  // language-specific slug overrides — e.g. an explicit `slug:` in
  // `book.config.yaml` — would slot in here without changing callers.
  const slugByPathPerLang: Record<string, Map<string, string>> = {};
  for (const peerLang of availableLanguages) {
    const peerNav = bookConfig.navigation[peerLang] ?? [];
    const map = new Map<string, string>();
    for (const entry of peerNav) {
      map.set(entry.path, slugFromNavPath(entry.path));
    }
    slugByPathPerLang[peerLang] = map;
  }

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

  // FR-2737 reserved-slug guard: `RESERVED_HOME_SLUG` is the slug
  // the synthetic home chapter writes to (`<lang>/index.html`). If a
  // real chapter's `nav.path` ever sanitizes to that same value
  // (e.g. somebody adds `index.md`), the chapter HTML and the home
  // HTML would target the same file — only the last writer would
  // win, silently. Fail the build with an actionable error instead
  // of producing a broken site.
  const collidingSlug = chapters.find(
    (c) => c.slug === RESERVED_HOME_SLUG,
  );
  if (collidingSlug) {
    throw new Error(
      `Chapter slug "${RESERVED_HOME_SLUG}" is reserved for the home page. ` +
        `The chapter titled "${collidingSlug.title}" sanitizes to that ` +
        `slug — rename the source file or move it under a sub-folder ` +
        `(e.g. "overview/index.md") in book.config.yaml.`,
    );
  }

  // Pre-record this build's pages into the cross-version registry. We
  // do it BEFORE rendering so the version-switcher availability map
  // (which uses the registry transitively only for the *current* slug)
  // remains correct in the common case where versions share slugs.
  // See note on the `availability` field below.
  //
  // FR-2737: also register the synthetic home slug for the home
  // page. Every language ships an `index.html`, so listing it lets
  // the version switcher resolve "same slug in another version" to
  // that version's home page rather than falling back to Quickstart
  // when the user changes the version from the landing screen.
  const recordedSlugs = new Set(allSlugsThisLang);
  recordedSlugs.add(RESERVED_HOME_SLUG);
  for (const slug of recordedSlugs) {
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

  // ── FR-2722: Copy images first so the optimizer can run before page
  // rendering, populating the `<picture>` availability map used during
  // HTML rewrite. The order swap is intentional — when --optimize-images
  // is OFF, this is just a relocated copy step (same I/O, same bytes).
  // When ON, optimizeImage() runs in-line after each PNG copy.
  const destImagesDir = path.join(langDir, "images");
  // Map from page-relative URL (`./images/foo.png`) → variant filenames.
  // Empty when --optimize-images is off; the rewrite is a no-op in that case.
  const variantAvailability = new Map<string, ImageVariantInfo>();
  if (fs.existsSync(srcImagesDir)) {
    fs.mkdirSync(destImagesDir, { recursive: true });
    const imageFiles = fs.readdirSync(srcImagesDir);
    let imageCount = 0;
    for (const file of imageFiles) {
      const srcPath = path.join(srcImagesDir, file);
      if (!fs.statSync(srcPath).isFile()) continue;
      fs.copyFileSync(srcPath, path.join(destImagesDir, file));
      imageCount++;

      if (optimizeImages && /\.png$/i.test(file)) {
        const result = await optimizeImage(srcPath, destImagesDir, {
          avif: optimizeImagesAvif,
          // Cache lives at the website build root (`dist/web/.image-optimizer-cache/`)
          // so identical images across languages / versions share entries.
          cacheDir: optimizerCacheDir,
        });
        recordOptimizeStat(optimizeStats, result);
        if (result.webp || result.avif) {
          const key = `./images/${file}`;
          const variants: ImageVariantInfo = {};
          if (result.webp) variants.webp = `./images/${result.webp}`;
          if (result.avif) variants.avif = `./images/${result.avif}`;
          variantAvailability.set(key, variants);
        }
      }
    }
    console.log(`${labelPrefix} Copied ${imageCount} images`);
  }

  // Generate individual HTML pages
  console.log(`${labelPrefix} Generating ${chapters.length} pages...`);
  for (let i = 0; i < chapters.length; i++) {
    const navEntry = navigation.find(
      (n) => slugFromNavPath(n.path) === chapters[i].slug,
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

    // ── F2: Per-page SEO context ──────────────────────────────
    // pagePath is the URL-relative path used in the cross-version
    // page registry. canonicalPath uses F6's canonicalPathFor() so
    // non-latest versions point at the latest version's same slug.
    const pagePath =
      versionLabel !== null
        ? `${versionLabel}/${lang}/${chapters[i].slug}.html`
        : `${lang}/${chapters[i].slug}.html`;
    const canonicalPath = canonicalPathFor(
      loadedVersions,
      lang,
      chapters[i].slug,
    );
    const seo: PageSeoContext = {
      baseUrl: seoBase.baseUrl,
      siteName: seoBase.siteName,
      publisher: seoBase.publisher,
      pagePath,
      canonicalPath,
      ogImageRelUrl: seoBase.ogImageRelUrl,
      lastModifiedIso: lastDate ? lastDate.toISOString() : undefined,
    };
    if (lastDate) {
      lastModSink.set(pagePath, lastDate);
    }

    // Resolve the same chapter in every peer language. Missing peers
    // (e.g. a page only translated into a subset of languages) are still
    // listed in the switcher but link to that language's index page so
    // users always have an escape hatch.
    const peers: LanguagePeer[] = availableLanguages.map((peerLang) => {
      const peerSlug = navEntry
        ? slugByPathPerLang[peerLang]?.get(navEntry.path)
        : undefined;
      const langLabelPeer = config.languageLabels[peerLang] ?? peerLang;
      if (peerSlug) {
        return {
          lang: peerLang,
          label: langLabelPeer,
          href: `../${peerLang}/${peerSlug}.html`,
          available: true,
        };
      }
      return {
        lang: peerLang,
        label: langLabelPeer,
        href: `../${peerLang}/index.html`,
        available: false,
      };
    });

    // F3: resolve the page's category from the path (set when navGroups
    // were normalized). Empty string for legacy flat configs — the
    // breadcrumb renders without a middle segment in that case.
    const category = navEntry
      ? categoryByPath.get(navEntry.path) ?? ""
      : "";

    let pageHtml = buildWebPage({
      chapter: chapters[i],
      allChapters: chapters,
      currentIndex: i,
      metadata,
      config,
      navPath: navEntry?.path,
      lastUpdated: lastDate ? formatDate(lastDate, lang) : undefined,
      assets: pageAssets,
      peers,
      navGroups,
      category,
      versionContext,
      seo,
    });

    // Fix image paths for static site (./images/foo.png).
    pageHtml = rewriteImagePathsForStaticSite(pageHtml);

    // Apply lazy/async/width/height to every <img> after path rewriting,
    // so dimension lookup keys (`./images/x.png`) match the final HTML.
    pageHtml = applyImageAttributes(pageHtml, imageDims);

    // FR-2722: wrap eligible <img> tags in <picture> with WebP / AVIF
    // sources. No-op when --optimize-images is off (map is empty).
    if (variantAvailability.size > 0) {
      pageHtml = rewriteImageTagsToPicture(pageHtml, variantAvailability);
    }

    // Track image-attribute coverage for the post-build report.
    const imgStatsForPage = countImageAttrs(pageHtml);
    imageStats.total += imgStatsForPage.total;
    imageStats.withDims += imgStatsForPage.withDims;

    const outputPath = path.join(langDir, `${chapters[i].slug}.html`);
    fs.writeFileSync(outputPath, pageHtml, "utf-8");
  }

  // Generate index.html. FR-2737 replaces the legacy meta-refresh
  // redirect with a real Home page — production-quality intro to
  // Backend.AI WebUI and the manual itself, anchored to the current
  // language. The fallback below is intentionally kept for the
  // empty-navigation case (a language declared in book.config.yaml
  // with no chapters yet) so partial translations still produce a
  // visible page rather than crashing the build.
  let indexHtml: string;
  if (chapters.length === 0) {
    indexHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8" /><title>${title}</title></head>
<body><h1>${title}</h1><p>No documentation content was generated for this language.</p></body>
</html>`;
  } else {
    // Home page peers — every peer language has its own home, so the
    // switcher always lands on `../<peer>/index.html` and `available`
    // is always true. (Per-page availability is a chapter-level
    // concept that does not apply here.)
    const homePeers: LanguagePeer[] = availableLanguages.map((peerLang) => ({
      lang: peerLang,
      label: config.languageLabels[peerLang] ?? peerLang,
      href: `../${peerLang}/index.html`,
      available: true,
    }));
    // Version context for the home page. Reuses the per-page builder
    // with the reserved home slug so the version switcher's same-slug
    // navigation lands on each version's home rather than dropping
    // the user back into Quickstart on every version change.
    const homeVersionContext = buildPageVersionContext({
      loadedVersions,
      versionLabel,
      slug: RESERVED_HOME_SLUG,
      rootDepth,
      pageRegistry,
    });
    // Home page SEO. `pagePath` and `canonicalPath` both point at the
    // language's `index.html`, with the version segment included in
    // versioned mode so the OG / canonical URLs are accurate.
    const homePagePath =
      versionLabel !== null
        ? `${versionLabel}/${lang}/index.html`
        : `${lang}/index.html`;
    const homeCanonicalPath = loadedVersions.latest
      ? `${loadedVersions.latest.label}/${lang}/index.html`
      : homePagePath;
    const homeSeo: PageSeoContext = {
      baseUrl: seoBase.baseUrl,
      siteName: seoBase.siteName,
      publisher: seoBase.publisher,
      pagePath: homePagePath,
      canonicalPath: homeCanonicalPath,
      ogImageRelUrl: seoBase.ogImageRelUrl,
    };
    indexHtml = buildHomePage({
      metadata,
      config,
      navGroups,
      allChapters: chapters,
      assets: pageAssets,
      peers: homePeers,
      versionContext: homeVersionContext,
      seo: homeSeo,
    });
    // Mirror the chapter-page post-processing pipeline for image tags
    // (lazy-load attrs + WebP/AVIF rewrite). The home page does not
    // currently render `<img>` tags, but keeping the pipeline parity
    // means future content edits — e.g. adding a hero illustration —
    // pick up the same optimizations without further wiring.
    indexHtml = applyImageAttributes(indexHtml, imageDims);
    if (variantAvailability.size > 0) {
      indexHtml = rewriteImageTagsToPicture(indexHtml, variantAvailability);
    }
  }
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
  // FR-2731: also capture the current version's entry in this same pass
  // so a follow-up sub-task can render the PDF download card. We
  // deliberately omit `pdfTag` from the result (rather than store
  // `undefined` explicitly) so template engines that check for property
  // presence behave the same for "no entry" and "entry without tag".
  let currentEntry: Version | undefined;
  for (const v of loadedVersions.entries) {
    if (v.label === versionLabel) {
      // Always available: the page is being rendered right now in this version.
      slugAvailability[v.label] = true;
      currentEntry = v;
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
    ...(currentEntry?.pdfTag !== undefined
      ? { pdfTag: currentEntry.pdfTag }
      : {}),
  };
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

/**
 * Resolve and prepare the default OG image (F2). Two strategies:
 *
 *   1. Operator override via `og.imagePath` — file is copied verbatim
 *      into `dist/web/assets/og-default.<ext>`. Operators control the
 *      design; the toolkit just ships it.
 *   2. Default rendering — the bundled `manifest/backend.ai-brand-simple.svg`
 *      is rendered to a 1200×630 PNG via Playwright. The brand SVG path
 *      is resolved relative to the toolkit's project root candidates so
 *      the renderer works whether the toolkit is checked out as part of
 *      the monorepo (typical) or installed as a published package.
 *
 * Returns `null` (and warns) when neither path produces a file. The
 * generator passes that null through to every page's `PageSeoContext`,
 * which then drops the `og:image` tag rather than emitting a broken
 * reference.
 */
async function prepareOgImage(
  config: ResolvedDocConfig,
  assetsDir: string,
): Promise<RenderedOgImage | null> {
  const og = config.og;

  // Strategy 1: operator override.
  if (og?.imagePath) {
    const sourceAbs = path.resolve(config.projectRoot, og.imagePath);
    const result = copyUserOgImage({
      sourcePath: sourceAbs,
      destDir: assetsDir,
    });
    if (result) return result;
    // Fall through to default rendering when the override file is
    // missing — better than no OG image at all.
  }

  // Strategy 2: render the bundled brand SVG.
  const brandSvgCandidates = [
    // Monorepo layout — toolkit is at packages/backend.ai-docs-toolkit/
    // and the brand SVG is at <repo-root>/manifest/backend.ai-brand-simple.svg.
    path.resolve(
      config.projectRoot,
      "../../manifest/backend.ai-brand-simple.svg",
    ),
    // Workspace layout — docs site is the project root, brand lives at
    // a relative manifest dir.
    path.resolve(config.projectRoot, "manifest/backend.ai-brand-simple.svg"),
    // Direct override via the resolved logoPath — useful when operators
    // ship a custom brand SVG via `logoPath` but no separate `og.imagePath`.
    config.logoPath ?? "",
  ].filter((p): p is string => !!p && fs.existsSync(p));

  if (brandSvgCandidates.length === 0) {
    console.warn(
      "[og-image] No brand SVG found at any of the expected paths " +
        "(repo-root/manifest, projectRoot/manifest, or config.logoPath). " +
        "Skipping default OG image. Set `og.imagePath` to ship a static one.",
    );
    return null;
  }

  return renderDefaultOgImage({
    svgSourcePath: brandSvgCandidates[0],
    destDir: assetsDir,
  });
}

/**
 * Collapse internal whitespace runs (including newlines from YAML
 * `title: |` block scalars) into single spaces, then trim. Used by F2
 * to keep multi-line book titles from breaking Open Graph parsers.
 * F1 may later normalize `book.config.yaml`'s title at read-time,
 * making this redundant — until then F2 defends its own surface.
 */
function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * Normalize the `og.baseUrl` config value. Strips a trailing slash so
 * URL composition doesn't double up. Returns `undefined` when the
 * input is missing or doesn't look like an http(s) URL — consumers
 * use the undefined to skip absolute-URL tags entirely.
 */
function normalizeBaseUrl(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    console.warn(
      `[seo] og.baseUrl "${trimmed}" does not start with http(s):// — ignored.`,
    );
    return undefined;
  }
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}
