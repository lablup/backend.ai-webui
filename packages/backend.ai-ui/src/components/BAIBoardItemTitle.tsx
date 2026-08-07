import { theme } from '../theme-shim';
import BAIFlex from './BAIFlex';
import { Heading } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { CircleHelp } from 'lucide-react';
import React from 'react';

export interface BAIBoardItemTitleProps {
  title: React.ReactNode | string;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

// Z-index for sticky title in BAIBoardItem. Should be higher than antd table fixed columns
// (dynamically calculated based on column count) but lower than MainLayout header (z-index: 100).
const Z_INDEX_IN_BAI_BOARD_ITEM_TITLE = 50;

const BAIBoardItemTitle: React.FC<BAIBoardItemTitleProps> = ({
  title,
  tooltip,
  extra,
  style,
}) => {
  const { token } = theme.useToken();

  return (
    <BAIFlex
      align="center"
      justify="between"
      style={{
        paddingBlock: token.paddingMD,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        backgroundColor: token.colorBgContainer,
        zIndex: Z_INDEX_IN_BAI_BOARD_ITEM_TITLE,
        ...style,
      }}
      gap="xs"
      wrap="wrap"
    >
      <BAIFlex gap={'xs'} align="center" wrap="wrap">
        {typeof title === 'string' ? (
          // PILOT-DECISION: antd Typography.Title level={5} (16px) -> Astryx
          // Heading level={3} (17px); visual values follow Astryx defaults.
          <Heading level={3}>{title}</Heading>
        ) : (
          title
        )}
        {tooltip ? (
          <Tooltip content={tooltip}>
            <CircleHelp
              style={{ color: token.colorTextSecondary }}
              size="1em"
            />
          </Tooltip>
        ) : null}
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
