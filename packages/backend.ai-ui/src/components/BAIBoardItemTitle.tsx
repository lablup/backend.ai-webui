import BAIFlex from './BAIFlex';
import BAIQuestionIconWithTooltip from './BAIQuestionIconWithTooltip';
import { Heading } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import React from 'react';

export interface BAIBoardItemTitleProps {
  title: React.ReactNode | string;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

// Context-local: above the table's fixed columns (calculated per column count),
// below `BAI_Z_INDEX.appHeader` (see `styles/zIndexLadder.ts`).
const Z_INDEX_IN_BAI_BOARD_ITEM_TITLE = 50;

const BAIBoardItemTitle: React.FC<BAIBoardItemTitleProps> = ({
  title,
  tooltip,
  extra,
  style,
}) => {
  const { token } = useTheme();

  return (
    <BAIFlex
      align="center"
      justify="between"
      style={{
        paddingBlock: token('--spacing-5'),
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        backgroundColor: token('--color-background-surface'),
        zIndex: Z_INDEX_IN_BAI_BOARD_ITEM_TITLE,
        ...style,
      }}
      gap="xs"
      wrap="wrap"
    >
      <BAIFlex gap={'xs'} align="center" wrap="wrap">
        {typeof title === 'string' ? (
          // antd Typography.Title level={5} = 16px. `level={3}` was picked when
          // Astryx's heading ramp still started three rungs lower (h3 = 17px);
          // once `ANTD_ALIGN_TOKENS` restored the antd scale (38/30/24/20/16),
          // 16px moved to `level={5}` and h3 became 24px. Re-levelled by
          // RENDERED SIZE, which is what the original choice was tracking.
          <Heading level={5}>{title}</Heading>
        ) : (
          title
        )}
        {tooltip ? <BAIQuestionIconWithTooltip title={tooltip} /> : null}
      </BAIFlex>

      <BAIFlex
        gap={'xs'}
        align="center"
        justify="end"
        style={{ marginLeft: 'auto' }}
      >
        {extra}
      </BAIFlex>
    </BAIFlex>
  );
};

BAIBoardItemTitle.displayName = 'BAIBoardItemTitle';
export default BAIBoardItemTitle;
