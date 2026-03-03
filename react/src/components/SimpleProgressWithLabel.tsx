/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme, Tooltip, Typography } from 'antd';
import {
  BAIFlex,
  BAIProgressWithLabel,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import _ from 'lodash';

interface SimpleProgressWithLabelProps {
  size: 'small' | 'default';
  title: React.ReactNode;
  percent: string;
  tooltipTitle?: React.ReactNode;
  description?: React.ReactNode;
}

const SimpleProgressWithLabel: React.FC<SimpleProgressWithLabelProps> = ({
  size,
  title,
  percent,
  tooltipTitle,
  description,
}) => {
  'use memo';

  const { token } = theme.useToken();

  const formattedPercent = toFixedFloorWithoutTrailingZeros(percent || 0, 1);
  const percentLabel = formattedPercent + '%';

  if (size === 'default') {
    return (
      <>
        <BAIFlex justify="between">
          <Typography.Text>{title}</Typography.Text>
          {description && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {description}
            </Typography.Text>
          )}
        </BAIFlex>
        <BAIProgressWithLabel
          percent={_.toNumber(percent)}
          valueLabel={percentLabel}
          strokeColor="#BFBFBF"
          progressStyle={{ border: 'none' }}
          showInfo={false}
          labelStyle={{
            height: token.sizeXS,
          }}
        />
      </>
    );
  }

  return (
    <Tooltip title={tooltipTitle || title} placement="left">
      <BAIFlex direction="row" gap={'xxs'}>
        <BAIFlex
          style={{
            // Max width is 140px (even if over 100%), min width is 3px
            width: _.min([
              _.max([Math.round(_.toNumber(percent) * 1.4), 3]),
              140,
            ]),
            height: 12,
            backgroundColor: '#BFBFBF',
          }}
        ></BAIFlex>
        <Typography.Text
          style={{
            fontSize: token.fontSizeSM,
            lineHeight: `${token.fontSizeSM}px`,
          }}
        >
          {_.toNumber(percent).toFixed(0) + '%'}
        </Typography.Text>
      </BAIFlex>
    </Tooltip>
  );
};

export default SimpleProgressWithLabel;
