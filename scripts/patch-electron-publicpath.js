#!/usr/bin/env node

/**
 * Patch the web build output to use Electron's 'es6://' publicPath.
 *
 * When building for Electron, webpack's output.publicPath must be 'es6://'
 * instead of the default '/'. Previously this required a full second React
 * build (~4-8 min). This script achieves the same result by patching the
 * already-built files, saving significant CI time.
 *
 * Usage: node scripts/patch-electron-publicpath.js <build-dir>
 *
 * The script patches:
 *   1. index.html — static asset references (/static/... → es6://static/...)
 *   2. asset-manifest.json — all asset paths
 *   3. JS bundles — webpack runtime's publicPath assignment (e.g. n.p="/")
 *   4. CSS files — url() references to /static/ assets
 *   5. Service worker (sw.js) — precache manifest URLs
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

const WEB_PUBLIC_PATH = '/';
const ELECTRON_PUBLIC_PATH = 'es6://';

let patchedCount = 0;

/**
 * Replace all occurrences of web publicPath with electron publicPath in a file.
 */
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

console.log(`Patching publicPath: "${WEB_PUBLIC_PATH}" → "${ELECTRON_PUBLIC_PATH}"`);
console.log(`Build directory: ${buildDir}\n`);

// 1. Patch index.html
patchFile(path.join(buildDir, 'index.html'), [
  // Script/link tags: src="/static/... → src="es6://static/...
  ['="/static/', `="${ELECTRON_PUBLIC_PATH}static/`],
  // Href references
  ['href="/static/', `href="${ELECTRON_PUBLIC_PATH}static/`],
  // Manifest and other root-relative references
  ['="/manifest', `="${ELECTRON_PUBLIC_PATH}manifest`],
]);

// 2. Patch asset-manifest.json
patchFile(path.join(buildDir, 'asset-manifest.json'), [
  [`"/static/`, `"${ELECTRON_PUBLIC_PATH}static/`],
]);

// 3. Patch JS bundles (webpack runtime publicPath + chunk references)
const jsDir = path.join(buildDir, 'static', 'js');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
  for (const file of jsFiles) {
    patchFile(path.join(jsDir, file), [
      // Webpack runtime: various minified forms of __webpack_require__.p = "/"
      // Common patterns from webpack 5 + terser:
      ['.p="/"', `.p="${ELECTRON_PUBLIC_PATH}"`],
      [".p='/'", `.p='${ELECTRON_PUBLIC_PATH}'`],
      // Static references to /static/ in chunk loading code
      ['"/static/', `"${ELECTRON_PUBLIC_PATH}static/`],
    ]);
  }
}

// 4. Patch CSS files (url() references)
const cssDir = path.join(buildDir, 'static', 'css');
if (fs.existsSync(cssDir)) {
  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
  for (const file of cssFiles) {
    patchFile(path.join(cssDir, file), [
      ['url(/static/', `url(${ELECTRON_PUBLIC_PATH}static/`],
    ]);
  }
}

// 5. Patch service worker if present
patchFile(path.join(buildDir, 'sw.js'), [
  ['"/static/', `"${ELECTRON_PUBLIC_PATH}static/`],
  ['url:"/static/', `url:"${ELECTRON_PUBLIC_PATH}static/`],
]);

// 6. Patch workbox precache manifest if present
const swFiles = fs.readdirSync(buildDir).filter((f) => /^workbox-.*\.js$/.test(f));
for (const file of swFiles) {
  patchFile(path.join(buildDir, file), [
    ['"/static/', `"${ELECTRON_PUBLIC_PATH}static/`],
  ]);
}

console.log(`\nDone. Patched ${patchedCount} file(s).`);

// Verify the patch worked by checking index.html
const indexPath = path.join(buildDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  if (indexContent.includes('es6://static/js/main')) {
    console.log('✓ Verification passed: index.html contains es6://static/js/main');
  } else {
    console.error('✗ Verification failed: index.html does not contain es6://static/js/main');
    console.error('  The Electron build may not work correctly.');
    process.exit(1);
  }
}
