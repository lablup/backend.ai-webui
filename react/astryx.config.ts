import type { AstryxConfig } from '@astryxdesign/cli/authoring';

/**
 * Registers `backend.ai-ui` (BUI) as an Astryx CLI integration, so `astryx
 * component` / `search` / `docs` answer with the BAI* wrappers this project
 * actually uses instead of only Astryx core's primitives.
 *
 * The CLI reads this file from the nearest package.json root, and resolves
 * each integration from that root's `node_modules` — so it lives here (the
 * workspace whose devDependency the CLI is), not at the repository root.
 */
export default {
  integrations: ['backend.ai-ui'],
  issuesUrl: 'https://github.com/lablup/backend.ai-webui/issues',
} satisfies AstryxConfig;
