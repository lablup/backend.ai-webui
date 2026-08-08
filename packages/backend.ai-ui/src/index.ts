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
// NOTE: `./form-engine` is deliberately NOT re-exported here. It is an alias
// module — it currently forwards to antd (ticket 34's self-hosted engine is
// parked in `./form-engine/engine.ts`, see the banner there) — and republishing
// antd's `Form` under BUI's name would put a second, ambiguous source for
// `Form`/`FormInstance` on BUI's public API. BUI's own components import it
// relatively (`../form-engine`); app files use `react/src/form-engine`.
