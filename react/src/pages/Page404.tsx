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

const Page404 = () => {
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

  // The pill echoes the unknown path with all segments neutral: a 404 cannot
  // know WHICH segment failed to resolve (e.g. `/admi/default/start` breaks
  // on the first segment, not the last), so marking one would be a guess.
  // Error states that DO know the failing segment (ProjectScopeErrorState)
  // keep their `broken` marking. Long paths are capped with a leading
  // ellipsis so detail-page URLs stay readable.
  const rawSegments = location.pathname.split('/').filter(Boolean);
  const capped =
    rawSegments.length > MAX_SEGMENTS
      ? ['…', ...rawSegments.slice(-(MAX_SEGMENTS - 1))]
      : rawSegments;
  const segments: RouteErrorSegment[] = capped.map((text) => ({ text }));

  return (
    <RouteErrorContent
      segments={segments.length ? segments : undefined}
      title={<Trans i18nKey={'webui.NotFound'} />}
      description={t('webui.DescNotFound')}
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

export default Page404;
