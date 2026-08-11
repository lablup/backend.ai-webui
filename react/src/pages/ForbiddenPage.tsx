/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import RouteErrorContent, {
  RouteErrorSegment,
} from '../components/RouteErrorContent';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useActiveProjectName } from '../hooks/useRouteScope';
import {
  getPathFromMenuKey,
  useWebUIMenuItems,
} from '../hooks/useWebUIMenuItems';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { ArrowRightIcon } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const MAX_SEGMENTS = 4;

/**
 * Forbidden (401/403) page in the shared route-error language (FR-3383;
 * replaces the legacy image-based `Page401`). Unlike the not-found page, the
 * URL is valid — the user just lacks the required role — so every path
 * segment stays intact in the pill and the CTA routes to the user's own
 * first available page.
 */
const ForbiddenPage = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();
  const { firstAvailableMenuItem } = useWebUIMenuItems();
  const activeProjectName = useActiveProjectName();
  useSuspendedBackendaiClient(); //monkey patch for flickering

  const defaultPagePath = firstAvailableMenuItem
    ? getPathFromMenuKey(firstAvailableMenuItem.key, activeProjectName)
    : '/start';
  const defaultPageTitle =
    firstAvailableMenuItem?.labelText ?? t('webui.menu.FirstPageNameAlias');

  // The URL itself is valid here — no segment is "broken". Show the path
  // quietly for orientation, capped like Page404 for long detail URLs.
  const rawSegments = location.pathname.split('/').filter(Boolean);
  const capped =
    rawSegments.length > MAX_SEGMENTS
      ? ['…', ...rawSegments.slice(-(MAX_SEGMENTS - 1))]
      : rawSegments;
  const segments: RouteErrorSegment[] = capped.map((text) => ({ text }));

  return (
    <RouteErrorContent
      segments={segments.length ? segments : undefined}
      title={<Trans i18nKey={'webui.UnauthorizedAccess'} />}
      description={t('webui.AdminOnlyPage')}
      extra={
        // PILOT-DECISION: antd `Button type="primary" size="large"` with a
        // trailing icon (`iconPosition="end"`) → Astryx `Button
        // variant="primary" size="lg"` + `endContent` (MAPPING §3.3). Astryx
        // has no `iconPosition`; the trailing slot is `endContent`, which is
        // typed for Icon/Badge elements, so the lucide glyph is wrapped in
        // Astryx `Icon`.
        <Button
          variant="primary"
          size="lg"
          endContent={<Icon icon={ArrowRightIcon} />}
          label={t('button.GoBackToStartPage', { title: defaultPageTitle })}
          onClick={() => webuiNavigate(defaultPagePath)}
        />
      }
    />
  );
};

export default ForbiddenPage;
