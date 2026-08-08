/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import { Tooltip, Typography } from 'antd';
import {
  BAIFlex,
  BAIProgressWithLabel,
  toFixedFloorWithoutTrailingZeros,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';

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
          // Mode-blind hardcode fixed (sweep #3). `#BFBFBF` is exactly antd's
          // `colorTextQuaternary` — rgba(0,0,0,0.25) composited on white —
          // i.e. the neutral "bar" grey, never a brand value. Written as a
          // literal it stayed #BFBFBF in dark mode too, where it all but
          // vanished against the backdrop. The theme-shim carries that token
          // verbatim (`selfTokens`, verdict 'self') as a light/dark pair, so
          // routing through it restores the legacy light value EXACTLY and
          // gets rgba(255,255,255,0.25) in dark for free.
          strokeColor={token.colorTextQuaternary}
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
            // Same mode-blind hardcode as `strokeColor` above — this bare
            // div IS the small-size variant's bar.
            backgroundColor: token.colorTextQuaternary,
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
