import { createReadStream, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

/**
 * FR-3764 — dev-only WebMCP relay wiring.
 *
 * Serves two browser assets straight out of `node_modules` and injects them
 * into the dev document:
 *
 *  - `@mcp-b/global` (IIFE) installs `document.modelContext`, the spec entry
 *    point `useWebMCPTool` registers against.
 *  - `@mcp-b/webmcp-local-relay`'s `embed.js` opens a hidden widget iframe that
 *    bridges those tools to `webmcp-local-relay` on loopback, so an MCP client
 *    (Claude Code) can list and call them against the open tab.
 *
 * Nothing is vendored into the repo: the assets are read from the installed
 * packages, so they cannot drift from the versions in `pnpm-lock.yaml`.
 *
 * Off by default and dev-only by construction:
 *  - `apply: 'serve'` — the plugin does not exist during `vite build`.
 *  - Without `VITE_WEBMCP=on` the factory returns an inert plugin: no
 *    middleware, no script tags, and `withWebMCPCspHeaders` is the identity.
 *
 * Registration note: must come AFTER `projectRootStaticPlugin` in the plugins
 * array — that plugin's `order: 'pre'` HTML handler re-reads the template and
 * discards earlier transforms. This plugin injects with `order: 'post'`.
 */

/** URL prefix the relay assets are served under (same-origin, so CSP `'self'`). */
export const WEBMCP_ASSET_BASE = '/__webmcp/';

const GLOBAL_URL = `${WEBMCP_ASSET_BASE}global.iife.js`;
const EMBED_URL = `${WEBMCP_ASSET_BASE}embed.js`;

/**
 * `VITE_WEBMCP=on` is the single switch. `vite.config.ts` runs `loadEnv()` into
 * `process.env` before building the plugins array, so a value from a `.env*`
 * file counts too — not just a shell var.
 */
export function isWebMCPEnabled(): boolean {
  return (process.env.VITE_WEBMCP ?? '').toLowerCase() === 'on';
}

/**
 * The relay's widget iframe is a `blob:` URL (embed.js fetches `widget.html`,
 * injects the relay config, and re-serves it as a Blob), which the dev
 * `frame-src` does not allow. Only the ENFORCING header is patched: under
 * `VITE_DEV_CSP=report` nothing is blocked anyway, and the report is more
 * useful describing the policy production would ship.
 */
export function withWebMCPCspHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const policy = headers['Content-Security-Policy'];
  if (!isWebMCPEnabled() || !policy) {
    return headers;
  }
  const patched = policy
    .split(';')
    .map((directive) =>
      /^\s*frame-src\b/.test(directive) && !/\bblob:/.test(directive)
        ? `${directive.trimEnd()} blob:`
        : directive,
    )
    .join(';');
  return { ...headers, 'Content-Security-Policy': patched };
}

/**
 * Absolute paths of the two packages' browser assets, resolved from `react/`.
 * `null` when the optional dev packages are not installed.
 */
function resolveAssetPaths(): Record<string, string> | null {
  const require = createRequire(import.meta.url);
  try {
    // The relay's exports map hides `dist/browser`, so walk up from its main
    // entry instead of asking the resolver for a subpath it does not declare.
    const relayDist = dirname(require.resolve('@mcp-b/webmcp-local-relay'));
    const paths = {
      [GLOBAL_URL]: require.resolve('@mcp-b/global/iife'),
      [EMBED_URL]: join(relayDist, 'browser/embed.js'),
      // embed.js resolves `new URL('widget.html', <its own src>)`, so the
      // widget must be a sibling of the embed URL above.
      [`${WEBMCP_ASSET_BASE}widget.html`]: join(
        relayDist,
        'browser/widget.html',
      ),
    };
    return Object.values(paths).every((file) => existsSync(file))
      ? paths
      : null;
  } catch {
    return null;
  }
}

const CONTENT_TYPE: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};

export function devWebMCPPlugin(): Plugin {
  const assets = isWebMCPEnabled() ? resolveAssetPaths() : null;
  if (!assets) {
    return { name: 'bai-dev-webmcp', apply: 'serve' };
  }

  return {
    name: 'bai-dev-webmcp',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const file = assets[url];
        if (!file) return next();
        res.setHeader(
          'Content-Type',
          CONTENT_TYPE[url.slice(url.lastIndexOf('.'))] ??
            'application/octet-stream',
        );
        res.setHeader('Cache-Control', 'no-store');
        createReadStream(file).pipe(res);
      });
      server.config.logger.info(
        `[webmcp] enabled — relay assets at ${WEBMCP_ASSET_BASE}`,
      );
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return {
          html,
          tags: [
            // Classic (non-module) scripts, injected in this order into
            // <head>: both run before the app's deferred module entry, so
            // `document.modelContext` exists by the time components mount.
            { tag: 'script', attrs: { src: GLOBAL_URL }, injectTo: 'head' },
            { tag: 'script', attrs: { src: EMBED_URL }, injectTo: 'head' },
          ],
        };
      },
    },
  };
}
