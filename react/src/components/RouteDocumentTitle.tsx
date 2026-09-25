/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { applyRouteDocumentTitle } from '../helper/documentTitle';
import { useCurrentRouteLabel } from '../hooks/useCurrentRouteLabel';
import { useEffect } from 'react';

/** Keeps `document.title` at `<page label> · Backend.AI` for the matched route. */
const RouteDocumentTitle: React.FC = () => {
  'use memo';
  const label = useCurrentRouteLabel();

  useEffect(() => {
    applyRouteDocumentTitle(label);
  }, [label]);

  return null;
};

export default RouteDocumentTitle;
