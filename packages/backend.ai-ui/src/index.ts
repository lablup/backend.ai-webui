/// <reference types="vite-plugin-svgr/client" />
// BUI's own stylesheet (ticket 30). Kept as the FIRST statement so bundlers
// that consume BUI from source get the `@layer components` rules before any
// component module evaluates. `package.json#sideEffects` lists `**/*.css`
// precisely so this import survives tree-shaking; consumers of the built
// `dist` that bundle CSS separately import `backend.ai-ui/styles.css`.
import './styles/backend.ai-ui.css';

export * from './components';
export * from './helper';
export * from './hooks';
export * from './icons';
export * from './tests';
export * from './theme-shim';
export * from './app-shim';
// The self-hosted form engine (tickets 34 + 35). `Form` is exported as a NAMED
// export only — BUI has no default export — and `react/src/form-engine`
// re-exports it for app files, mirroring app-shim / theme-shim. Safe to
// republish now that the alias resolves to BUI's OWN engine rather than
// forwarding to antd: there is only one `Form`/`FormInstance` in the graph.
export * from './form-engine';
