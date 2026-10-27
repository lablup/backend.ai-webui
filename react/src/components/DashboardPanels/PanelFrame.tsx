/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelDetailLinkButton from './PanelDetailLinkButton';
import PanelEditControls from './PanelEditControls';
import PanelSettingsHeaderControls, {
  PanelHeaderSettingsContext,
} from './PanelSettingsHeaderControls';
import { Heading } from '@lablup/ui-common/Heading';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIBoardItemTitle, BAIFlex, BAIIconWithTooltip } from 'backend.ai-ui';
import { CircleHelp } from 'lucide-react';
import React, { use } from 'react';

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
  const { token } = useTheme();
  const hasHeaderSettings = !!use(PanelHeaderSettingsContext);
  const heading = icon ? (
    <BAIFlex align="center" gap="xs">
      {icon}
      <Heading level={5} maxLines={1}>
        {title}
      </Heading>
    </BAIFlex>
  ) : hasHeaderSettings ? (
    <Heading level={5}>{title}</Heading>
  ) : (
    title
  );

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{ paddingInline: token('--spacing-8'), height: '100%' }}
    >
      <BAIBoardItemTitle
        title={
          hasHeaderSettings ? (
            // The card's own controls follow the title and its help glyph; the row's end keeps the actions.
            <BAIFlex align="center" gap="xs" wrap="wrap">
              {heading}
              {tooltip ? (
                <BAIIconWithTooltip
                  icon={<CircleHelp size="1em" />}
                  content={tooltip}
                />
              ) : null}
              <PanelSettingsHeaderControls />
            </BAIFlex>
          ) : (
            heading
          )
        }
        tooltip={hasHeaderSettings ? undefined : tooltip}
        extra={
          <BAIFlex align="center" gap="xxs">
            {extra}
            <PanelDetailLinkButton />
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
