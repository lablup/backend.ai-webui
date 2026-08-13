/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter for Astryx's `as` link slot (to-astryx ticket 24).

 Astryx's navigable primitives (`BreadcrumbItem`, `SideNavItem`, `Tab`, `Link`)
 accept a `LinkComponentType` through `as` and hand it an **`href`**. The app's
 router link (`WebUILink`, a react-router `Link` with an error-boundary escape
 hatch) takes a **`to`**. This 12-line shim is that translation, so the ~40
 navigation call sites do not each hand-roll it.

 Keeping the anchor real matters: it is what preserves middle-click,
 "open in new tab" and "copy link address" through the SPA router.
*/
import WebUILink from './WebUILink';
import React from 'react';

export interface AstryxRouterLinkProps extends Omit<
  React.ComponentProps<typeof WebUILink>,
  'to'
> {
  /** Astryx passes the destination as `href`; react-router wants `to`. */
  href?: string;
}

const AstryxRouterLink: React.FC<AstryxRouterLinkProps> = ({
  href,
  ...props
}) => <WebUILink to={href ?? ''} {...props} />;

export default AstryxRouterLink;
