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
import type { PageAssets, WebsiteMetadata } from "./website-builder.js";
import { generateWebsiteStyles } from "./styles-web.js";
import { getDocVersion } from "./version.js";
import type { ResolvedDocConfig } from "./config.js";
import { writeHashedAsset, type AssetManifest } from "./asset-hasher.js";
import { readImageDimensions } from "./image-meta.js";

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
 * Generate a static website from documentation sources.
 */
export async function generateWebsite(
  config: ResolvedDocConfig,
  options?: Partial<GenerateWebsiteOptions>,
): Promise<void> {
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
  console.log(`${productName} Website Generator`);
  console.log(`Title: ${title}`);
  console.log(`Version: ${version}`);
  console.log(`Languages: ${languages.join(", ")}`);
  console.log(
    `Strict: ${strict ? "on (broken links fail the build)" : "off (warnings only)"}`,
  );
  console.log("");

  // Create shared assets directory and write CSS / search.js with content hashes.
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
  let totalImgTags = 0;
  let totalImgWithDims = 0;

  for (const lang of languages) {
    const startTime = Date.now();
    console.log(`[${lang}] Building website...`);

    const navigation = bookConfig.navigation[lang];
    if (!navigation) {
      console.warn(`[${lang}] No navigation found, skipping`);
      continue;
    }

    // Create language output directory
    const langDir = path.join(distBase, lang);
    fs.mkdirSync(langDir, { recursive: true });

    // Process markdown files (multi-page mode)
    console.log(`[${lang}] Processing ${navigation.length} chapters...`);
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

    // Per-page asset manifest (every page in every language references the
    // same hashed assets; the search.js + styles.css are language-agnostic).
    const pageAssets: PageAssets = {
      styles: assetManifest["styles.css"],
      search: assetManifest["search.js"],
      codeCopy: assetManifest["code-copy.js"],
      favicon: rootAssets.favicon,
      appleTouchIcon: rootAssets.appleTouchIcon,
      webmanifest: rootAssets.webmanifest,
    };

    // Generate individual HTML pages
    console.log(`[${lang}] Generating ${chapters.length} pages...`);
    for (let i = 0; i < chapters.length; i++) {
      const navEntry = navigation.find(
        (n) => slugify(n.title) === chapters[i].slug,
      );
      if (!navEntry) {
        console.warn(
          `[${lang}] No navigation entry found for chapter slug "${chapters[i].slug}"`,
        );
      }
      const navFilePath = navEntry ? path.join(lang, navEntry.path) : undefined;
      const lastDate = navFilePath
        ? lastModifiedDates.get(navFilePath)
        : undefined;

      let pageHtml = buildWebPage({
        chapter: chapters[i],
        allChapters: chapters,
        currentIndex: i,
        metadata,
        config,
        navPath: navEntry?.path,
        lastUpdated: lastDate ? formatDate(lastDate, lang) : undefined,
        assets: pageAssets,
      });

      // Fix image paths for static site (./images/foo.png).
      pageHtml = rewriteImagePathsForStaticSite(pageHtml);

      // Apply lazy/async/width/height to every <img> after path rewriting,
      // so dimension lookup keys (`./images/x.png`) match the final HTML.
      pageHtml = applyImageAttributes(pageHtml, imageDims);

      // Track image-attribute coverage for the post-build report.
      const imgStats = countImageAttrs(pageHtml);
      totalImgTags += imgStats.total;
      totalImgWithDims += imgStats.withDims;

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

    // Build search index
    const searchIndex = buildSearchIndex(chapters, lang);
    const searchIndexJson = JSON.stringify(searchIndex);
    fs.writeFileSync(
      path.join(langDir, "search-index.json"),
      searchIndexJson,
      "utf-8",
    );
    const indexSizeKb = (Buffer.byteLength(searchIndexJson) / 1024).toFixed(0);
    console.log(
      `[${lang}] Search index: ${Object.keys(searchIndex.index).length} terms (${indexSizeKb} KB)`,
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
      console.log(`[${lang}] Copied ${imageCount} images`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[${lang}] Done: ${chapters.length} pages generated (${elapsed}s)`,
    );
    console.log("");
  }

  // Image-attribute coverage report (loading/decoding are 100% via post-
  // processing; width/height depends on parsed PNG headers).
  if (totalImgTags > 0) {
    const dimPct = ((totalImgWithDims / totalImgTags) * 100).toFixed(1);
    console.log(
      `Images: ${totalImgTags} total — width/height present on ${totalImgWithDims} (${dimPct}%); loading/decoding present on all.`,
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
