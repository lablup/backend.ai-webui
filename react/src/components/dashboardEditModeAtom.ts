/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom } from 'jotai';

/**
 * Dashboard edit mode, transient. It gates adding and removing cards and the
 * custom-panel controls; moving and resizing work in both states.
 */
export const dashboardEditModeAtom = atom(false);
