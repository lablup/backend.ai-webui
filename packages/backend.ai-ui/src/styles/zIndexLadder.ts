/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The one z-index ladder (FR-3578 T10): every full-window layer takes a NAME here
 instead of a number. `zIndexLadder.css` and `index.html` hand-mirror these
 values; `scripts/migration-gates/z-index-ladder-gate.mjs` fails on drift.

 | Layer | Value | Owner |
 |---|---|---|
 | `appHeader` | 100 | `MainLayout` header; `SiderToggleButton` sits one above it |
 | (reserved) | 101–899 | unowned. A layer placed here sits BELOW the boot curtain, so anything that must stay visible during boot belongs above `splash` |
 | `splash` | 900 | `index.html` `#splash`, which stays mounted as the logged-out backdrop. It sits BELOW `modalBase` deliberately: every dialog is a `document.body` portal now, so no login-screen wrapper can lift one over a splash that outranks the band |
 | `loginHost` | 950 | `InteractiveLoginPage`'s full-viewport card host |
 | (theme-shim) | 1000–1002 | a SECOND vocabulary this ladder does not own: `theme-shim`'s `zIndexPopupBase` (1000, operator-settable through `resources/antdThemeConfig.schema.json`), read by `FolderExplorerModal` (`+ 2`); lab `Drawer`'s non-modal base is 1000 too, and `DragAndDrop` sits at 1001 |
 | `loginSideHelp` | 1060 | `LoginFormPanel`'s side help panel |
 | `modalBase` | 1100 | `BAIDialogPortal`, plus `BAI_Z_INDEX_MODAL_LEVEL_STEP` per nesting level |
 | `notification` | 11000 | `.bai-notification-stack` |
 | (CSS top layer) | above all | Astryx `Toast`/`Popover`/`DropdownMenu`/`Tooltip`, lab `Drawer` — not stackable against this ladder |
 | context-local stacking | off the ladder at any magnitude | `BAIBoard.css`, `BAITableAstryx*`, `BAICompactGroup.css` — local to a subtree |
*/
import './zIndexLadder.css';

/** Low → high; `zIndexLadder.test.ts` pins the declaration order increasing. */
export const BAI_Z_INDEX = {
  appHeader: 100,
  splash: 900,
  loginHost: 950,
  loginSideHelp: 1060,
  modalBase: 1100,
  notification: 11000,
} as const;

/** Each nested `BAIDialogPortal` claims one step above `modalBase`. */
export const BAI_Z_INDEX_MODAL_LEVEL_STEP = 10;
