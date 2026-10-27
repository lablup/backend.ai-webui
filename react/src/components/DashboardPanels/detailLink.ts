/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { RouteScope } from '../../helper/pathBuilder';
import type { PanelDefinition, PanelPage, PanelSettings } from './types';
import { createContext } from 'react';

/** The list page a card's header button opens, in the route scope of the dashboard page. */
export interface PanelDetailLink {
  /** The destination's scope-relative feature key, e.g. `session`. */
  feature: string;
  /** Only query keys the destination page parses. */
  query?: Readonly<Record<string, string>>;
  /** The destination menu's label key, named in the button's tooltip. */
  labelKey: string;
}

export interface PanelDetailLinkContext {
  page: PanelPage;
  settings: PanelSettings | undefined;
}

/** A resolved link the shared card header renders as its "View in" button. */
export interface ResolvedDetailLink {
  scope: RouteScope;
  feature: string;
  search: string;
  labelKey: string;
}

export const PAGE_ROUTE_SCOPE: Record<PanelPage, RouteScope> = {
  project: 'project',
  projectAdmin: 'projectAdmin',
  admin: 'admin',
};

export const resolveDetailLink = (
  definition: PanelDefinition,
  context: PanelDetailLinkContext,
): ResolvedDetailLink | null => {
  const link = definition.detailLink?.(context);
  if (!link) return null;
  const search = new URLSearchParams(link.query ?? {}).toString();
  return {
    scope: PAGE_ROUTE_SCOPE[context.page],
    feature: link.feature,
    search: search ? `?${search}` : '',
    labelKey: link.labelKey,
  };
};

export const DetailLinkContext = createContext<ResolvedDetailLink | null>(null);
