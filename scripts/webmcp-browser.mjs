#!/usr/bin/env node
// FR-3750 prototype — keeps a logged-in Chromium tab open on the dev server and
// exposes a tiny loopback control API so the WebMCP relay can be exercised from
// a separate Node process while we watch the screen.
//
//   WEBUI_URL=https://fr-3750.localhost:1357 EMAIL=... PASSWORD=... ENDPOINT=... \
//     node scripts/webmcp-browser.mjs
//   curl -s localhost:9555/js -d 'location.href'
//   curl -s localhost:9555/console
//   curl -s localhost:9555/shot -o shot.png
//   curl -s localhost:9555/newtab            # open a second logged-in tab
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, '..', 'package.json'));
const { chromium } = require('@playwright/test');

const url = process.env.WEBUI_URL;
const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors'] });
const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1400, height: 900 } });
const pages = [];
const logs = [];

const openTab = async () => {
  const page = await context.newPage();
  const idx = pages.push(page) - 1;
  page.on('console', (m) => logs.push(`[tab${idx}][${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`[tab${idx}][pageerror] ${e.message}`));
  page.on('websocket', (ws) => {
    logs.push(`[tab${idx}][ws open] ${ws.url()}`);
    ws.on('close', () => logs.push(`[tab${idx}][ws close] ${ws.url()}`));
    ws.on('socketerror', (e) => logs.push(`[tab${idx}][ws error] ${ws.url()} ${e}`));
    ws.on('framesent', (f) => logs.push(`[tab${idx}][ws >] ${String(f.payload).slice(0, 300)}`));
    ws.on('framereceived', (f) => logs.push(`[tab${idx}][ws <] ${String(f.payload).slice(0, 300)}`));
  });
  await page.goto(url);
  if (idx === 0) try {
    await page.getByLabel('Email or Username').fill(process.env.EMAIL, { timeout: 15000 });
    await page.getByLabel('Password').fill(process.env.PASSWORD);
    const endpointInput = page.getByRole('textbox', { name: 'Endpoint' });
    if (await endpointInput.isVisible().catch(() => false)) {
      await endpointInput.fill(process.env.ENDPOINT);
    }
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 60000 }).catch(() => {});
  } catch (e) {
    console.log('[browser] login failed, tab kept open:', e.message.split('\n')[0]);
  }
  return page;
};

await openTab();
console.log('[browser] logged in:', pages[0].url());

http
  .createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    const tab = Number(new URL(req.url, 'http://x').searchParams.get('tab') ?? 0);
    const page = pages[tab];
    try {
      if (req.url.startsWith('/js')) {
        const r = await page.evaluate(body);
        res.end(JSON.stringify(r ?? null, null, 2));
      } else if (req.url.startsWith('/frames')) {
        const out = [];
        for (const f of page.frames()) {
          try { out.push({ url: f.url().slice(0, 80), r: await f.evaluate(body) }); }
          catch (e) { out.push({ url: f.url().slice(0, 80), err: String(e).slice(0, 200) }); }
        }
        res.end(JSON.stringify(out, null, 2));
      } else if (req.url.startsWith('/key')) {
        await page.keyboard.press(body || 'Escape');
        res.end('pressed ' + (body || 'Escape'));
      } else if (req.url.startsWith('/shot')) {
        res.setHeader('content-type', 'image/png');
        res.end(await page.screenshot());
      } else if (req.url.startsWith('/console')) {
        res.end(logs.splice(0).join('\n'));
      } else if (req.url.startsWith('/url')) {
        res.end(page.url());
      } else if (req.url.startsWith('/newtab')) {
        const p = await openTab();
        res.end(`tab${pages.length - 1} ${p.url()}`);
      } else if (req.url.startsWith('/text')) {
        res.end(await page.locator('body').innerText());
      } else if (req.url.startsWith('/quit')) {
        res.end('bye');
        await browser.close();
        process.exit(0);
      } else {
        res.statusCode = 404;
        res.end('unknown');
      }
    } catch (e) {
      res.statusCode = 500;
      res.end(String(e?.stack ?? e));
    }
  })
  .listen(9555, '127.0.0.1', () => console.log('[browser] control api on 127.0.0.1:9555'));
