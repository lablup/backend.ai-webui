/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useProjectPath } from '../../hooks/useRouteScope';
import PanelEditControls from './PanelEditControls';
import { DetailLinkContext } from './detailLink';
import { Heading } from '@lablup/ui-common/Heading';
import { IconButton } from '@lablup/ui-common/IconButton';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIBoardItemTitle, BAIFlex } from 'backend.ai-ui';
import { ArrowUpRight } from 'lucide-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

export interface PanelFrameProps {
  title: string;
  /** A small glyph before the title. */
  icon?: React.ReactNode;
  tooltip?: React.ReactNode;
  /** Card controls shown in the title row. */
  extra?: React.ReactNode;
  onEdit?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

/**
 * The shared custom-panel shell, matching the built-in board items: the same
 * horizontal inset, a sticky title row (with the edit/remove controls while
 * the board is in edit mode), and a scrollable body. The dashboard's own
 * refresh control refreshes it.
 */
const PanelFrame: React.FC<PanelFrameProps> = ({
  title,
  icon,
  tooltip,
  extra,
  onEdit,
  onRemove,
  children,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const navigate = useWebUINavigate();
  const buildPath = useProjectPath();
  const detailLink = useContext(DetailLinkContext);
  const detailLabel = detailLink
    ? t('dashboard.card.ViewIn', { name: t(detailLink.labelKey) })
    : undefined;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ paddingInline: token('--spacing-8'), height: '100%' }}
    >
      <BAIBoardItemTitle
        title={
          icon ? (
            <BAIFlex align="center" gap="xs">
              {icon}
              <Heading level={5} maxLines={1}>
                {title}
              </Heading>
            </BAIFlex>
          ) : (
            title
          )
        }
        tooltip={tooltip}
        extra={
          <BAIFlex align="center" gap="xxs">
            {extra}
            {detailLink && detailLabel ? (
              <IconButton
                variant="ghost"
                size="sm"
                label={detailLabel}
                tooltip={detailLabel}
                icon={<ArrowUpRight size="1em" />}
                onClick={() =>
                  navigate(
                    buildPath(detailLink.feature, {
                      scope: detailLink.scope,
                    }) + detailLink.search,
                  )
                }
              />
            ) : null}
            <PanelEditControls
              title={title}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          </BAIFlex>
        }
      />
      <BAIFlex
        direction="column"
        align="stretch"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          marginBottom: token('--spacing-4'),
        }}
      >
        {children}
      </BAIFlex>
    </BAIFlex>
  );
};

export default PanelFrame;
