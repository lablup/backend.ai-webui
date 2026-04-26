/**
 * Default Open Graph image renderer (F2 / FR-2714).
 *
 * Renders an SVG file (typically `manifest/backend.ai-brand-simple.svg`)
 * to a 1200×630 PNG using Playwright's headless Chromium. The result is
 * written to `dist/web/assets/og-default.png`. We use Playwright because
 * it is already a peer dep of the toolkit (used by the PDF pipeline)
 * and because rendering an SVG to PNG without a real browser engine
 * would require pulling in resvg/sharp, both heavyweight native deps.
 *
 * If Playwright isn't installed (the consumer skipped the optional peer
 * dep) the renderer returns `null` after logging a warning. The website
 * generator gracefully drops the `og:image` tag in that case rather
 * than crashing the build — the spec explicitly allows this fallback
 * to keep air-gapped consumers without a browser engine working.
 */

import fs from "fs";
import path from "path";

/**
 * Result of an OG image render attempt. `path` is the absolute
 * destination path written to disk; `relUrl` is the URL fragment to
 * embed in `<meta property="og:image">` (relative to the website
 * output root, e.g. `assets/og-default.png`).
 */
export interface RenderedOgImage {
  absPath: string;
  relUrl: string;
}

/**
 * Render the default OG image. Inputs:
 *   - `svgSourcePath`: absolute path to the source SVG file.
 *   - `destDir`: absolute path to the assets directory
 *      (`<distBase>/assets`). Created if missing.
 *   - `width` / `height`: PNG dimensions. Defaults to 1200×630, the
 *      Facebook-recommended OG image size that also satisfies Twitter's
 *      `summary_large_image` minimum.
 *
 * Returns `null` when Playwright is unavailable, the SVG is missing,
 * or rendering fails for any reason. A warning is printed in each
 * case; the caller decides whether to fall back to "no og:image".
 */
export async function renderDefaultOgImage(args: {
  svgSourcePath: string;
  destDir: string;
  width?: number;
  height?: number;
}): Promise<RenderedOgImage | null> {
  const { svgSourcePath, destDir } = args;
  const width = args.width ?? 1200;
  const height = args.height ?? 630;

  if (!fs.existsSync(svgSourcePath)) {
    console.warn(
      `[og-image] Source SVG not found at ${svgSourcePath}. Skipping default OG image.`,
    );
    return null;
  }

  // Try to load Playwright. The dynamic import keeps it optional —
  // consumers without the peer dep just don't get an OG image.
  let chromium: typeof import("playwright").chromium;
  try {
    // Use a dynamic import so the toolkit never hard-imports playwright
    // at top-level. Bare-string import is required so bundlers don't
    // try to inline the dep into the toolkit's published artifact.
    const playwright =
      (await import("playwright")) as typeof import("playwright");
    chromium = playwright.chromium;
  } catch {
    console.warn(
      "[og-image] Playwright is not installed. Skipping default OG image. " +
        "Install playwright as a peer dep, or set `og.imagePath` to ship a pre-rendered image.",
    );
    return null;
  }

  const svgContent = fs.readFileSync(svgSourcePath, "utf-8");

  // Center the SVG on a Backend.AI-orange background. Twitter and OG
  // both crop center-out; the safe-area is roughly the middle 80% of
  // the canvas.
  // We use `<img src="data:image/svg+xml;base64,...">` instead of
  // inlining the SVG markup directly because the source SVG contains
  // an XML declaration + DOCTYPE that confuses HTML parsers.
  const svgBase64 = Buffer.from(svgContent, "utf-8").toString("base64");
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: ${width}px;
        height: ${height}px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      img {
        width: 60%;
        height: auto;
      }
    </style>
  </head>
  <body>
    <img src="data:image/svg+xml;base64,${svgBase64}" />
  </body>
</html>`;

  fs.mkdirSync(destDir, { recursive: true });
  const outPath = path.join(destDir, "og-default.png");

  let browser: import("playwright").Browser | null = null;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    // Air-gap enforcement: block ALL non-local network requests before
    // the page sees any content. The wrapping HTML is inlined via
    // setContent and the brand SVG is embedded as a base64 data URI,
    // so legitimate rendering only ever needs `data:` and `about:blank`
    // (the initial document URL Playwright assigns to setContent pages).
    // An adversarial SVG that smuggles `<image href="http://…">` or
    // `xlink:href="https://…"` would otherwise cause the headless
    // browser to fetch external resources at build time, which the
    // F2 spec explicitly forbids. Do NOT remove this route handler.
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith("data:") || url.startsWith("about:")) {
        return route.continue();
      }
      return route.abort();
    });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: outPath, type: "png", fullPage: false });
    await context.close();
  } catch (err) {
    console.warn(
      `[og-image] Failed to render default OG image: ${
        err instanceof Error ? err.message : String(err)
      }. Skipping og:image tag.`,
    );
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close errors — the file is already written.
      }
    }
  }

  return {
    absPath: outPath,
    relUrl: "assets/og-default.png",
  };
}

/**
 * Copy a user-provided OG image from `og.imagePath` into the assets
 * directory. The destination filename preserves the source extension
 * so MIME detection works on naive web servers.
 *
 * Returns `null` (and warns) when the source is missing.
 */
export function copyUserOgImage(args: {
  sourcePath: string;
  destDir: string;
}): RenderedOgImage | null {
  const { sourcePath, destDir } = args;
  if (!fs.existsSync(sourcePath)) {
    console.warn(
      `[og-image] og.imagePath points to a non-existent file: ${sourcePath}. ` +
        `Falling back to default rendering (or skipping og:image entirely).`,
    );
    return null;
  }
  fs.mkdirSync(destDir, { recursive: true });
  const ext = path.extname(sourcePath).toLowerCase() || ".png";
  const destFile = `og-default${ext}`;
  const dest = path.join(destDir, destFile);
  fs.copyFileSync(sourcePath, dest);
  return {
    absPath: dest,
    relUrl: `assets/${destFile}`,
  };
}
