/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

// Self-host Monaco from /resources/monaco/vs instead of the default jsDelivr
// CDN, so the editor works in offline and air-gapped environments. The tree
// is served by the craco dev server (mapped to react/node_modules/monaco-
// editor/min/vs) and copied to build/web/resources/monaco/vs during the
// production build (see root `copymonaco` script). The `/resources` prefix
// is used to nest Monaco inside the existing static-asset namespace (same
// place as `/resources/theme.schema.json`, `/resources/model-definition.
// schema.json`, etc.) so we do not introduce a new top-level URL route.
// The AMD module prefix stays `vs/` because Monaco's internal module IDs
// reference `vs/editor/editor.main` etc. — only the URL prefix changes.
//
// The absolute `/resources/monaco/vs` path relies on the app being served
// from the origin root in both web and Electron builds. In Electron,
// `electron-app/main.js` rewrites root-absolute `file://` requests to the
// packaged `app/` directory, which is what makes
// `/resources/monaco/vs/loader.js` resolve to
// `app/resources/monaco/vs/loader.js` — if that protocol handler changes,
// Monaco loading breaks here. Sub-path web deployments would need this path
// rewritten relative to the deploy base URL.
//
// `loader.config` must be called before the first `loader.init()` (which
// `<Editor>` triggers on mount). Centralizing the import + config here
// ensures every call site uses the same configured loader and that the
// loader module and the Editor module land in a single lazy chunk.
let monacoModulePromise: Promise<typeof import('@monaco-editor/react')> | null =
  null;

export const loadMonacoEditor = () => {
  if (!monacoModulePromise) {
    monacoModulePromise = import('@monaco-editor/react').then((module) => {
      module.loader.config({ paths: { vs: '/resources/monaco/vs' } });
      return module;
    });
  }
  return monacoModulePromise;
};
