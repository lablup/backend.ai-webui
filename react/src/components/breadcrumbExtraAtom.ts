/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom } from 'jotai';
import type { ReactNode } from 'react';

/**
 * Right-aligned action slot for the breadcrumb bar. A page sets this (e.g. via a
 * mount effect) to teleport a page-scoped action into the shared breadcrumb
 * container rendered by `MainLayout`/`WebUIBreadcrumb`; it clears on unmount.
 */
export const breadcrumbExtraAtom = atom<ReactNode>(null);
