/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { atom } from 'jotai';

export type RouteErrorKind = 'forbidden' | 'not_found' | 'error';

export interface RouteErrorScreen {
  kind: RouteErrorKind;
  /** Plain-text title of the screen, used for the tab title. */
  label: string;
}

/** The route-error screen shown in the content area, or `null`. `RouteErrorContent` owns it. */
export const routeErrorScreenAtom = atom<RouteErrorScreen | null>(null);
