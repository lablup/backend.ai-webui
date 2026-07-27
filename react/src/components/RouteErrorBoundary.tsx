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
 *   other Response statuses -> a minimal unexpected-error notice.
 *
 * Non-Response errors (render/Relay throws) are re-thrown: a route
 * `errorElement` catches BEFORE the React error boundary wrapping the Outlet,
 * so handling them here would displace `BAIErrorBoundary` (retry/reset,
 * expired-login re-login CTA, GraphQL error detail). Only router-thrown
 * `Response`s belong to this boundary.
 */
const RouteErrorBoundary = () => {
  'use memo';
  const { t } = useTranslation();
  const error = useRouteError();

  // `isRouteErrorResponse` only recognizes the internal ErrorResponseImpl that
  // react-router creates for loader/action throws; a raw `Response` thrown
  // during render is a plain Response instance. Accept both.
  const status = isRouteErrorResponse(error)
    ? error.status
    : error instanceof Response
      ? error.status
      : undefined;

  if (status === undefined) {
    throw error;
  }

  if (status === 404) {
    return <Page404 />;
  }
  if (status === 401 || status === 403) {
    return <Page401 />;
  }

  return (
    <RouteErrorContent
      title={t('dialog.ErrorOccurred')}
      description={t('error.UnexpectedError')}
    />
  );
};

export default RouteErrorBoundary;
