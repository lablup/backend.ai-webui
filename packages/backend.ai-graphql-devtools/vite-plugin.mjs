import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAIN_URL = new URL('./src/main.tsx', import.meta.url);
const PANEL_URL = new URL('./src/Panel.tsx', import.meta.url);
const SCHEMA_URL = '/__graphql-devtools/schema.graphql';

export function graphqlDevtools({ schemaPath, clientDirectivesPath }) {
  return {
    name: 'bai-graphql-devtools',
    apply: 'serve',
    config(config) {
      return {
        optimizeDeps: {
          entries: [
            relative(
              config.root ?? process.cwd(),
              fileURLToPath(PANEL_URL),
            ).replaceAll('\\', '/'),
          ],
        },
      };
    },
    configureServer(server) {
      server.middlewares.use(SCHEMA_URL, async (_req, res, next) => {
        try {
          const parts = await Promise.all(
            [schemaPath, clientDirectivesPath].map((path) =>
              readFile(path, 'utf8'),
            ),
          );
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(parts.join('\n'));
        } catch (error) {
          next(error);
        }
      });
    },
    transformIndexHtml: () => [
      {
        tag: 'script',
        attrs: { type: 'module', src: `/@fs${MAIN_URL.pathname}` },
        // Ahead of the app entry, so the fetch wrapper exists before the app's
        // modules run (graphql-sse keeps the `fetch` it sees at creation).
        injectTo: 'head-prepend',
      },
    ],
  };
}
