/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
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
          <Text>{title}</Text>
          {/* antd `type="secondary" fontSize={fontSizeSM}` is exactly Astryx's
              `supporting` semantic type (smaller + secondary colour) — the
              defaults-first mapping, no inline font size. */}
          {description && <Text type="supporting">{description}</Text>}
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
    <Tooltip content={tooltipTitle || title} placement="start">
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
        {/* PILOT-DECISION: the tight `lineHeight: fontSizeSM` is dropped —
            Astryx's `supporting` type owns its line-height, and the row is
            already vertically centred by BAIFlex. */}
        <Text type="supporting" color="primary">
          {_.toNumber(percent).toFixed(0) + '%'}
        </Text>
      </BAIFlex>
    </Tooltip>
  );
};

export default SimpleProgressWithLabel;
