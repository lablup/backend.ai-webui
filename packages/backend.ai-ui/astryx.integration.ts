import type { AstryxIntegration } from '@astryxdesign/cli/authoring';

/**
 * What BUI contributes to the Astryx CLI. Identity (name, version) comes from
 * package.json; every root below is optional and only the ones we ship are
 * declared. No `templates` / `codemods`: BUI ships neither.
 */
export default {
  components: './src/components',
  docs: './src/astryx-docs',
  issuesUrl: 'https://github.com/lablup/backend.ai-webui/issues',
} satisfies AstryxIntegration;
