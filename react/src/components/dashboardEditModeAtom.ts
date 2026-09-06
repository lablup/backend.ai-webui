/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom } from 'jotai';

/**
 * Dashboard edit-mode flag. Transient (not persisted). It gates only the
 * custom-panel affordances — the edit sider and the per-panel edit/remove
 * controls. Dragging and resizing are never gated: the board stays
 * rearrangeable in both states. Toggled by the breadcrumb
 * {@link DashboardEditToggleButton}.
 */
export const dashboardEditModeAtom = atom(false);
