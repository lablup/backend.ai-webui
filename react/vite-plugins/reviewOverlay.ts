import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/**
 * FR-3309 — dev-only review overlay (walking skeleton).
 *
 * Injects a same-origin <script> into the dev document that mounts a
 * Shadow-DOM review overlay (element pick → pin → comment → Teams thread
 * round trip). The overlay talks to the REVIEWER'S OWN local board app relay
 * (`http://localhost:7777/api/teams/*`, FR-3306/FR-3309 in lablup/claude-mp)
 * — never to this dev server, which has no review middleware at all
 * (spec pr-devserver-review.md §7/§8 + Revision 2 R2.2).
 *
 * Dev-only by construction:
 *  - `apply: 'serve'` — the plugin does not exist during `vite build`, so
 *    production output contains no trace of the overlay.
 *  - The script is served same-origin at /__review/overlay.js by a
 *    `configureServer` middleware (same pattern as `monacoStaticPlugin`),
 *    so it rides the viewer's tunnel and passes the dev CSP
 *    (`script-src 'self'`; the relay call is covered by the dev
 *    `connect-src … http:`).
 *
 * Registration note: must be registered AFTER `projectRootStaticPlugin` in
 * the plugins array — that plugin's `order: 'pre'` transformIndexHtml
 * handler discards the incoming html and re-reads the template, so anything
 * injected before it is thrown away. This plugin uses `order: 'post'` tag
 * injection on top of the resolved template.
 */

const OVERLAY_URL = '/__review/overlay.js';

const clientFile = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'reviewOverlayClient.js',
);

export function devReviewOverlayPlugin(): Plugin {
  return {
    name: 'bai-dev-review-overlay',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.url.split('?')[0] !== OVERLAY_URL) return next();
        res.setHeader('Content-Type', 'application/javascript');
        // Always re-read: overlay iteration shows up on plain reload
        // without restarting the dev server (the file is tiny).
        res.setHeader('Cache-Control', 'no-store');
        res.end(readFileSync(clientFile, 'utf-8'));
      });
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              attrs: { type: 'module', src: OVERLAY_URL },
              injectTo: 'body',
            },
          ],
        };
      },
    },
  };
}
