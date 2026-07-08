/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import Page401 from '../pages/Page401';
import Page404 from '../pages/Page404';
import RouteErrorContent from './RouteErrorContent';
import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

/**
 * Route-level error boundary (react-router `errorElement`) mounted on a
 * pathless route INSIDE MainLayout, so errors replace only the content area
 * while the shell (header / sidebar) stays up.
 *
 * Pages and future loaders/guards can `throw new Response(null, { status })`
 * to converge on the shared route-error language:
 *   404 -> not-found page, 401/403 -> forbidden page,
 *   anything else -> a minimal unexpected-error notice.
 */
const RouteErrorBoundary = () => {
  'use memo';
  const { t } = useTranslation();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <Page404 />;
    }
    if (error.status === 401 || error.status === 403) {
      return <Page401 />;
    }
  }

  return (
    <RouteErrorContent
      title={t('dialog.ErrorOccurred')}
      description={t('error.UnexpectedError')}
    />
  );
};

export default RouteErrorBoundary;
