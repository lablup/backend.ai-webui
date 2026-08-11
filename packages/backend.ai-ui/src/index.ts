/// <reference types="vite-plugin-svgr/client" />
// BUI's stylesheets, kept as the FIRST statements so bundlers that consume BUI
// from source get them before any component module evaluates.
// `package.json#sideEffects` lists `**/*.css` precisely so these imports
// survive tree-shaking; consumers of the built `dist` that bundle CSS
// separately import `backend.ai-ui/styles.css`.
//
// The two are ordered alphabetically by the import sorter, NOT by intent, and
// that is safe: ticket 30's "must come first" requirement is about the `@layer`
// ORDER STATEMENT, which lives in `backend.ai-ui.css`. `actionAccent.css`
// declares no layer at all (QA-FINDINGS Q-37 — it has to outrank Astryx's
// `@layer astryx-base` ghost-button colour, and only an unlayered rule can),
// so it cannot influence layer precedence in either position, and
// `backend.ai-ui.css` is still the first LAYERED sheet in the bundle.
//
// `.bai-action-accent` is imported from the barrel rather than from a component
// because both BUI (`BAIText`) and app-side call sites under
// `react/src/components` use the class; no single component owns it.
import './styles/actionAccent.css';
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
// The `locale` prop shape for `<BAIConfigProvider>`. Hosts used to reach the
// per-language modules under `backend.ai-ui/dist/locale/*` for this; that
// package export existed only to ship antd `Locale` bundles and went away with
// the ConfigProvider layer (to-astryx final switch), so the type is published
// from the main entry instead. The i18next INSTANCE stays unexported on
// purpose — BUI components bind to it explicitly via `useBAIi18n()`.
export type { BAILocale } from './locale';
