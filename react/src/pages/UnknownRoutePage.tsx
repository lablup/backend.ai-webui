/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getRouteScopeAndKey } from '../hooks/useRouteScope';
import {
  useWebUIPluginLoadedValue,
  useWebUIPluginValue,
} from '../hooks/useWebUIPluginState';
import Page404 from './Page404';
import { useLocation } from 'react-router-dom';

/**
 * Plugin-aware catch-all (`path: '*'`) element. With the scope subtrees each
 * carrying their own wildcard, react-router matching IS the existence check —
 * any URL that reaches this component matches no real route.
 *
 * Two cases are still not a 404:
 *  - plugins have not finished loading (their pages have no React routes),
 *    so render nothing to avoid a 404 flash on refresh;
 *  - the feature segment IS a Lit plugin page — the legacy shell renders it,
 *    so the React side must stay empty.
 */
const UnknownRoutePage = () => {
  'use memo';
  const location = useLocation();
  const plugins = useWebUIPluginValue();
  const isPluginLoaded = useWebUIPluginLoadedValue();

  if (!isPluginLoaded) {
    return null;
  }
  const { featureKey } = getRouteScopeAndKey(location.pathname);
  if (featureKey && plugins?.page?.some((page) => page?.url === featureKey)) {
    return null;
  }
  return <Page404 />;
};

export default UnknownRoutePage;
