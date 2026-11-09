import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAIN_URL = new URL('./src/main.tsx', import.meta.url);
const PANEL_URL = new URL('./src/Panel.tsx', import.meta.url);
const SCHEMA_URL = '/__graphql-devtools/schema.graphql';

export function graphqlDevtools({ schemaPath }) {
  return {
    name: 'bai-graphql-devtools',
    apply: 'serve',
    config(config) {
      return {
        optimizeDeps: {
          entries: [
            relative(config.root ?? process.cwd(), fileURLToPath(PANEL_URL)),
          ],
        },
      };
    },
    configureServer(server) {
      server.middlewares.use(SCHEMA_URL, async (_req, res, next) => {
        try {
          const sdl = await readFile(schemaPath);
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(sdl);
        } catch (error) {
          next(error);
        }
      });
    },
    transformIndexHtml: () => [
      {
        tag: 'script',
        attrs: { type: 'module', src: `/@fs${MAIN_URL.pathname}` },
        injectTo: 'body',
      },
    ],
  };
}
