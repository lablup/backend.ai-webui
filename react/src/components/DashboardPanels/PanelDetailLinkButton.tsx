/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useProjectPath } from '../../hooks/useRouteScope';
import { DetailLinkContext } from './detailLink';
import { Button } from '@lablup/ui-common/Button';
import { ChevronRight } from 'lucide-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

/** The card header's "View all" button; renders nothing when the card has no detail link. */
const PanelDetailLinkButton: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const navigate = useWebUINavigate();
  const buildPath = useProjectPath();
  const detailLink = useContext(DetailLinkContext);
  if (!detailLink) return null;
  const detailLabel = t('dashboard.card.ViewIn', {
    name: t(detailLink.labelKey),
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      label={t('dashboard.card.ViewAll')}
      aria-label={detailLabel}
      tooltip={detailLabel}
      endContent={<ChevronRight size="1em" />}
      onClick={() =>
        navigate(
          buildPath(detailLink.feature, { scope: detailLink.scope }) +
            detailLink.search,
        )
      }
    />
  );
};

export default PanelDetailLinkButton;
