/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The one z-index ladder (FR-3578 T10). Every layer that can cover the whole
 window asks for a NAME here instead of writing a number; `zIndexLadder.css`
 declares the same values as custom properties for stylesheets.

 | Layer | Value | Owner |
 |---|---|---|
 | in-page stacking | 1–60 | `BAIBoard.css`, `BAITableAstryx*`, `BAICompactGroup.css` — local to a subtree, deliberately off the ladder |
 | `appHeader` | 100 | `MainLayout` header; `SiderToggleButton` sits one above it |
 | `splash` | 900 | `index.html` `#splash`, which stays mounted as the logged-out backdrop |
 | `loginHost` | 950 | `InteractiveLoginPage`'s full-viewport card host |
 | (lab `Drawer` non-modal base) | 1000 | `@astryxdesign/lab`, module-private — recorded so nothing lands on it |
 | `loginSideHelp` | 1060 | `LoginFormPanel`'s side help panel |
 | `modalBase` | 1100 | `BAIDialogPortal`, plus `BAI_Z_INDEX_MODAL_LEVEL_STEP` per nesting level |
 | `notification` | 11000 | `.bai-notification-stack` |

 `splash` sits BELOW `modalBase` deliberately: it only ever has to cover page
 content, and since every dialog became a `document.body` portal no
 login-screen wrapper can lift one over it.

 NOT on the ladder, and above all of it: Astryx `Toast`/`Popover`/
 `DropdownMenu`/`Tooltip` and lab `Drawer` render in the CSS top layer. So a
 modal opened from a lab `Drawer` still paints under that drawer — drawers are
 out of scope for FR-3578, and "notices are always visible" holds for
 everything on this ladder, not for the top layer.
*/
import './zIndexLadder.css';

export const BAI_Z_INDEX = {
  appHeader: 100,
  splash: 900,
  loginHost: 950,
  loginSideHelp: 1060,
  modalBase: 1100,
  notification: 11000,
} as const;

export type BAIZIndexLayer = keyof typeof BAI_Z_INDEX;

/** Each nested `BAIDialogPortal` claims one step above `modalBase`. */
export const BAI_Z_INDEX_MODAL_LEVEL_STEP = 10;

/** Low → high. `zIndexLadder.test.ts` pins this strictly increasing. */
export const BAI_Z_INDEX_ORDER = [
  'appHeader',
  'splash',
  'loginHost',
  'loginSideHelp',
  'modalBase',
  'notification',
] as const satisfies ReadonlyArray<BAIZIndexLayer>;
