/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Astryx module augmentations for the custom variants the Backend.AI theme
 defines (to-astryx phase 3, ticket A).

 `astryx theme build` generates these automatically — but into the APP's tree
 (`react/src/astryx-theme/built/bai-r*-*.variants.d.ts`), and this package is a
 separate TypeScript project that never sees that file. Without a local copy,
 `<Text color="danger">` inside a BUI component is a type error even though the
 CSS the theme emits (`.astryx-text.danger`) is exactly what renders it.

 KEEP IN SYNC with `react/src/astryx-theme/backendAiTheme.ts`
 (`STATUS_TEXT_COLORS`) — that module is the source of truth; this file only
 restates its `color:*` keys for the type system. `backendAiTheme.test.ts`
 covers the theme side; a drift here surfaces as a `tsc` error at the call
 site, which is the intended failure mode.
*/
import '@astryxdesign/core/Text';

declare module '@astryxdesign/core/Text' {
  interface TextColorMap {
    /** antd `Typography.Text type="danger"` — painted from `--color-error`. */
    danger: true;
    /** antd `Typography.Text type="warning"` — painted from `--color-warning`. */
    warning: true;
    /** antd `Typography.Text type="success"` — painted from `--color-success`. */
    success: true;
  }
}
