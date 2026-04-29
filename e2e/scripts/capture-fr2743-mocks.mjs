#!/usr/bin/env node
// FR-2743 mock-DOM screenshot capture (headless).
// Loads antd CSS from dev server, then injects mock HTML per item × per lang.
//
// Run: node e2e/scripts/capture-fr2743-mocks.mjs [filter]
//   filter: optional substring to limit which items to capture.

import { chromium } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

import { items } from './fr2743-mocks/index.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const IMAGES_DIR = (lang) => path.join(ROOT, 'packages/backend.ai-webui-docs/src', lang, 'images');

const DEV_URL = process.env.DEV_URL || 'https://fr-2743.localhost:1355/start';
const LANGS = ['en', 'ko', 'ja', 'th'];
const filter = process.argv[2] || '';

async function main() {
  const targetItems = filter
    ? items.filter((it) => it.file.includes(filter))
    : items;

  console.log(`[FR-2743] capturing ${targetItems.length} items × ${LANGS.length} langs = ${targetItems.length * LANGS.length} PNGs`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 3000, height: 2000 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Load antd CSS by visiting the dev server
  console.log(`[FR-2743] loading antd CSS from ${DEV_URL}`);
  try {
    await page.goto(DEV_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
  } catch (err) {
    console.warn(`[FR-2743] dev server load failed (${err.message}); proceeding anyway`);
  }

  let success = 0;
  let failure = 0;
  const errors = [];

  for (const item of targetItems) {
    for (const lang of LANGS) {
      try {
        const html = item.render(lang);
        // Build a fresh page that keeps antd CSS, replaces body content
        await page.evaluate((h) => {
          document.body.innerHTML = `<div class="ant-app" style="background:#fff;padding:0;margin:0;">${h}</div>`;
          document.body.style.background = '#fff';
          document.body.style.margin = '0';
          document.body.style.padding = '0';
        }, html);

        await page.waitForTimeout(150); // let layout settle

        // Get bounding box of the rendered element
        const targetSelector = item.targetSelector || '.ant-app > *';
        const handle = await page.$(targetSelector);
        if (!handle) {
          throw new Error(`element not found: ${targetSelector}`);
        }
        const box = await handle.boundingBox();
        if (!box) {
          throw new Error(`no bounding box for ${targetSelector}`);
        }

        // Round to integers, add padding if requested
        const pad = item.padding ?? 0;
        const clip = {
          x: Math.max(0, Math.floor(box.x - pad)),
          y: Math.max(0, Math.floor(box.y - pad)),
          width: Math.ceil(box.width + pad * 2),
          height: Math.ceil(box.height + pad * 2),
        };

        const outDir = IMAGES_DIR(lang);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        const outPath = path.join(outDir, `${item.file}.png`);

        await page.screenshot({ path: outPath, clip });
        success++;
        process.stdout.write('.');
      } catch (err) {
        failure++;
        errors.push(`${item.file} [${lang}]: ${err.message}`);
        process.stdout.write('x');
      }
    }
    process.stdout.write(' ');
  }
  console.log();

  await browser.close();

  console.log(`\n[FR-2743] success=${success} failure=${failure}`);
  if (errors.length) {
    console.log('\nErrors:');
    errors.slice(0, 20).forEach((e) => console.log(`  - ${e}`));
    if (errors.length > 20) console.log(`  ... and ${errors.length - 20} more`);
  }
  process.exit(failure > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
