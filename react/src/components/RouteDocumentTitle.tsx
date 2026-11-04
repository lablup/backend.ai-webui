/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { applyRouteDocumentTitle } from '../helper/documentTitle';
import { routeErrorScreenAtom } from '../helper/routeErrorScreen';
import { useCurrentRouteLabel } from '../hooks/useCurrentRouteLabel';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

/**
 * Keeps `document.title` at `<page label> · Backend.AI` for the matched route,
 * or for the error screen shown in its place.
 */
const RouteDocumentTitle: React.FC = () => {
  'use memo';
  const routeLabel = useCurrentRouteLabel();
  const routeErrorScreen = useAtomValue(routeErrorScreenAtom);
  const label = routeErrorScreen?.label ?? routeLabel;

  useEffect(() => {
    applyRouteDocumentTitle(label);
  }, [label]);

  return null;
};

export default RouteDocumentTitle;
