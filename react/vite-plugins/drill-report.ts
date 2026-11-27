/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import type { Plugin } from 'vite';

const PREFIX = '/__drill/';
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
};

/** The file under `reportRoot` a `/__drill/…` path names, or null. */
export function drillReportFile(
  reportRoot: string,
  urlPath: string,
): string | null {
  if (!urlPath.startsWith(PREFIX)) return null;
  let rest: string;
  try {
    rest = decodeURIComponent(urlPath.slice(PREFIX.length));
  } catch {
    return null;
  }
  if (rest === '' || rest.endsWith('/')) rest += 'index.html';
  const file = normalize(join(reportRoot, rest));
  if (!file.startsWith(reportRoot + sep)) return null;
  return TYPES[extname(file)] ? file : null;
}

/**
 * Serves the drill reports of this checkout (`e2e/drill-report/`) at
 * `/__drill/<id>/`, so the PR's dev server is where a drill is shared.
 */
export function drillReportPlugin(reportRoot: string): Plugin {
  return {
    name: 'bai-dev-drill-report',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0];
        if (!path.startsWith(PREFIX)) return next();
        const file = drillReportFile(reportRoot, path);
        if (!file || !statSync(file, { throwIfNoEntry: false })?.isFile()) {
          res.statusCode = 404;
          return res.end();
        }
        res.setHeader('Content-Type', TYPES[extname(file)]);
        res.setHeader('Cache-Control', 'no-store');
        createReadStream(file).pipe(res);
      });
    },
  };
}
