#!/usr/bin/env node

/**
 * Patch the Vite web build output to use Electron's 'es6://' publicPath.
 *
 * When building for Electron, asset URLs must use the custom 'es6://' scheme
 * (handled by electron-app/main.js) instead of the default '/'. Doing this
 * with a second `vite build` (BUILD_TARGET=electron + experimental.renderBuiltUrl)
 * doubles release CI time, which FR-2612 explicitly eliminated. This script
 * keeps the single-build model by patching the already-built files.
 *
 * Usage: node scripts/patch-electron-publicpath.js <build-dir>
 *
 * Vite's output layout (post-FR-2606 migration):
 *   - index.html with `<base href="/">` and `<script src="/assets/...">`
 *   - assets/*.js, assets/*.css, assets/<fonts/images>
 *   - sw.js + workbox-*.js (precache uses relative URLs, no patch needed)
 *   - JS chunks reference siblings via ESM imports already resolved by the HTML
 *     entry, so chunk file contents themselves carry no '/assets/' literals.
 *
 * Patched targets:
 *   1. index.html — script/link tags pointing to /assets/
 *   2. CSS files under assets/ — url(/assets/...) references (fonts, images)
 */

const fs = require('fs');
const path = require('path');

const buildDir = process.argv[2];

if (!buildDir) {
  console.error('Usage: node scripts/patch-electron-publicpath.js <build-dir>');
  process.exit(1);
}

if (!fs.existsSync(buildDir)) {
  console.error(`Build directory not found: ${buildDir}`);
  process.exit(1);
}

const ELECTRON_PUBLIC_PATH = 'es6://';

let patchedCount = 0;

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    patchedCount++;
    console.log(`  Patched: ${path.relative(buildDir, filePath)}`);
    return true;
  }
  return false;
}

console.log(
  `Patching asset URLs: "/assets/" and "url(/assets/...)" → "${ELECTRON_PUBLIC_PATH}assets/"`,
);
console.log(`Build directory: ${buildDir}\n`);

// 1. Patch index.html — only root-absolute refs
//
// Note: <base href="/"> is intentionally NOT patched. The webpack-era patch
// script left it untouched too. The renderer loads index.html via file://,
// and rewriting <base> to es6:// causes window.location/origin mismatches
// (history API, same-origin checks). Relative refs like "manifest/foo" and
// "resources/bar.css" resolve against the file:// document URL and read
// from the app dir, which is what Electron actually serves.
patchFile(path.join(buildDir, 'index.html'), [
  // src="/assets/... or href="/assets/...
  ['="/assets/', `="${ELECTRON_PUBLIC_PATH}assets/`],
]);

// 2. Patch CSS files under assets/ — url(/assets/...) references for fonts/images
const assetsDir = path.join(buildDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const cssFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
  for (const file of cssFiles) {
    patchFile(path.join(assetsDir, file), [
      ['url(/assets/', `url(${ELECTRON_PUBLIC_PATH}assets/`],
      // Quoted forms (rare but allowed by CSS spec)
      ['url("/assets/', `url("${ELECTRON_PUBLIC_PATH}assets/`],
      ["url('/assets/", `url('${ELECTRON_PUBLIC_PATH}assets/`],
    ]);
  }
}

console.log(`\nDone. Patched ${patchedCount} file(s).`);

// Verify the patch worked by checking index.html
const indexPath = path.join(buildDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  if (indexContent.includes(`${ELECTRON_PUBLIC_PATH}assets/`)) {
    console.log(`✓ Verification passed: index.html contains ${ELECTRON_PUBLIC_PATH}assets/`);
  } else {
    console.error(
      `✗ Verification failed: index.html does not contain ${ELECTRON_PUBLIC_PATH}assets/`,
    );
    console.error('  The Electron build will not work correctly.');
    process.exit(1);
  }
}
