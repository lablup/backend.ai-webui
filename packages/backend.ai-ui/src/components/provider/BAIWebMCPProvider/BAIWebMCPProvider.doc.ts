import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIWebMCPProvider',
  displayName: 'BAI WebMCP Provider',
  category: 'Utility',
  hidden: true,
  keywords: [
    'webmcp',
    'modelContext',
    'agent',
    'ai agent',
    'tool',
    'provider',
    'context',
  ],
  usage: {
    description:
      "Carries the host's runtime gate for WebMCP tools. `useWebMCPTool` registers a tool through `document.modelContext.registerTool` only when this provider is `enabled` and the browser implements the API; otherwise it never touches `document.modelContext`. Tools read, navigate or fill forms — they never submit a create or confirm action and never expose a destructive one (docs/adr/0009-webmcp-tool-surface.md).",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it once at the app root and feed `enabled` from the host configuration, so the whole tree shares one gate.',
      },
      {
        guidance: true,
        description:
          'Register a tool from the component that already holds its data, so it unregisters when that component unmounts.',
      },
      {
        guidance: false,
        description:
          'Register a tool that submits a form, confirms a dialog or deletes anything — an agent that drives the page can also press any in-page approval button.',
      },
    ],
  },
  props: [
    {
      name: 'enabled',
      type: 'boolean',
      default: 'false',
      description:
        'Turns tool registration on. With `false`, every `useWebMCPTool` in the subtree is a no-op.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The subtree whose `useWebMCPTool` calls read the gate.',
    },
  ],
  examples: [
    {
      label: 'App-root gate and one tool',
      code: `<BAIWebMCPProvider enabled={config.enableWebMCP}>
  <App />
</BAIWebMCPProvider>

// inside a component that holds the data
useWebMCPTool({
  name: 'bai_get_current_page',
  description: 'Where this tab is.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  annotations: { readOnlyHint: true },
  execute: () => ({ path: window.location.pathname }),
});`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
