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
 | (legacy 1000 band) | 1000–1002 | a SECOND vocabulary this ladder does not own: the antd-era popup base (1000), inlined by `FolderExplorerModal` (`+ 2`); lab `Drawer`'s non-modal base is 1000 too, and `DragAndDrop` sits at 1001 |
 | `modalBase` | 1100 | `BAIDialog` and `BAIDrawerPortal` (the scrimmed drawer), plus `BAI_Z_INDEX_MODAL_LEVEL_STEP` per level of the stack they share |
 | `loginSideHelp` | 1101 | `LoginFormPanel`'s side help panel — a fixed sibling anchored to the base modal's edge, so it clears that modal's mask but not a modal opened on top of it |
 | `notification` | 11000 | `.bai-notification-stack` |
 | (CSS top layer) | above all | Astryx `Toast`/`Popover`/`DropdownMenu`/`Tooltip`, `BAITour` — not stackable against this ladder. A NON-SCRIM lab `Drawer` is not here either: it opens with `show()`, so it stacks at the legacy 1000 band above |
 | context-local stacking | off the ladder at any magnitude | `BAIBoard.css`, `BAITable*`, `BAICompactGroup.css` — local to a subtree |
*/
import './zIndexLadder.css';

/** Low → high; `zIndexLadder.test.ts` pins the declaration order increasing. */
export const BAI_Z_INDEX = {
  appHeader: 100,
  splash: 900,
  loginHost: 950,
  modalBase: 1100,
  // One above `modalBase`, not a rung below it: the help panel is a companion
  // of the base modal (a fixed sibling anchored to its edge), so it must clear
  // that modal's mask while a modal opened ON TOP of it — level 1, 1110 — still
  // covers it.
  loginSideHelp: 1101,
  notification: 11000,
} as const;

/** Each nested portal — dialog or scrimmed drawer — claims one step above `modalBase`. */
export const BAI_Z_INDEX_MODAL_LEVEL_STEP = 10;
