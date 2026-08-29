/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { withDevServerTitlePrefix } from '../helper/devServerTitle';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useIsProjectAgnosticPage } from '../hooks/useIsProjectAgnosticPage';
import * as _ from 'lodash-es';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';

const TITLE_BASE = 'Backend.AI';
const SEGMENT_SEPARATOR = ' · ';
const HOST_SEPARATOR = ' @ ';

export interface DocumentTitleParts {
  /** The matched route's label — the same string the breadcrumb/sider shows. */
  page?: string | null;
  project?: string | null;
  /** Manager endpoint host, `host:port`. */
  host?: string | null;
}

/**
 * `Backend.AI · <page> · <project> @ <host>`. Every segment except the product
 * name is optional and simply drops out when absent.
 */
export const formatDocumentTitle = ({
  page,
  project,
  host,
}: DocumentTitleParts): string => {
  const title = _.compact(
    _.map([TITLE_BASE, page, project], (segment) => _.trim(segment ?? '')),
  ).join(SEGMENT_SEPARATOR);
  const trimmedHost = _.trim(host ?? '');
  return trimmedHost ? `${title}${HOST_SEPARATOR}${trimmedHost}` : title;
};

/**
 * `https://127.0.0.1:8090/` -> `127.0.0.1:8090`. Mirrors the client's own
 * `_endpointHost` derivation (scheme stripped, port kept) and drops any path.
 */
export const getEndpointHost = (endpoint?: string | null): string =>
  _.trim(endpoint ?? '')
    .replace(/^[a-zA-Z][\w+.-]*:\/\//, '')
    .replace(/\/.*$/, '');

interface RouteTitleHandle {
  title?: string;
  labelKey?: string;
}

/**
 * The deepest matched route that carries a label, resolved the same way
 * `WebUIBreadcrumb` resolves its last crumb. Empty for redirects and 404s.
 */
const useRoutePageLabel = (): string => {
  'use memo';
  const { t } = useTranslation();
  const matches = useMatches();

  const handle = _.findLast(matches, (match) => {
    const routeHandle = match?.handle as RouteTitleHandle | undefined;
    return !_.isEmpty(routeHandle?.title) || !_.isEmpty(routeHandle?.labelKey);
  })?.handle as RouteTitleHandle | undefined;

  if (handle?.title) {
    return handle.title;
  }
  return handle?.labelKey ? t(handle.labelKey) : '';
};

const DocumentTitleEffect: React.FC<DocumentTitleParts> = ({
  page,
  project,
  host,
}) => {
  'use memo';
  const title = withDevServerTitlePrefix(
    formatDocumentTitle({ page, project, host }),
  );

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

const ProjectScopedDocumentTitle: React.FC<{
  page: string;
  host: string;
}> = ({ page, host }) => {
  'use memo';
  // Sanctioned ambient read (ADR-0001): globally mounted, and only rendered
  // on project-scoped routes.
  const currentProject = useCurrentProjectValue();

  return (
    <DocumentTitleEffect
      page={page}
      project={currentProject?.name}
      host={host}
    />
  );
};

const ConnectedDocumentTitle: React.FC<{ page: string }> = ({ page }) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const host = getEndpointHost(baiClient?._config?.endpoint);

  return isProjectAgnosticPage ? (
    <DocumentTitleEffect page={page} host={host} />
  ) : (
    <ProjectScopedDocumentTitle page={page} host={host} />
  );
};

/**
 * Keeps `document.title` in sync with the current route (FR-3760). Mounted
 * once in the root route element, so the Suspense fallback owns the title
 * before the client connects (login screen: `Backend.AI · <page>`).
 */
const RouteDocumentTitle: React.FC = () => {
  'use memo';
  const page = useRoutePageLabel();

  return (
    <Suspense fallback={<DocumentTitleEffect page={page} />}>
      <ConnectedDocumentTitle page={page} />
    </Suspense>
  );
};

export default RouteDocumentTitle;
