/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom } from 'jotai';

/**
 * Dashboard edit-mode flag. Transient (not persisted). When false the board is
 * locked (no drag/resize, no per-panel edit affordances); when true the board's
 * items can be repositioned/resized. Toggled by the breadcrumb
 * {@link DashboardEditToggleButton}.
 */
export const dashboardEditModeAtom = atom(false);
