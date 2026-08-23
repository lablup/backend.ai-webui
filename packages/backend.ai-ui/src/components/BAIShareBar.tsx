/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 A categorical breakdown as one stacked proportion bar plus its legend — the
 shape that answers "how is this total split?" in a single glance, which a row
 of separate counters cannot.
*/
import './BAIShareBar.css';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import * as _ from 'lodash-es';
import React, { type ReactNode } from 'react';

export interface BAIShareBarSegment {
  key: string;
  label: ReactNode;
  value: number;
  /** A colour token reference, e.g. `var(--color-icon-blue)`. */
  color: string;
}

export interface BAIShareBarProps {
  segments: Array<BAIShareBarSegment>;
  style?: React.CSSProperties;
}

const BAIShareBar: React.FC<BAIShareBarProps> = ({ segments, style }) => {
  const total = _.sumBy(segments, 'value');

  return (
    <div className="bai-share-bar" style={style}>
      <div className="bai-share-bar__track">
        {total > 0
          ? _.map(
              _.filter(segments, (s) => s.value > 0),
              (segment) => (
                <Tooltip
                  key={segment.key}
                  content={`${segment.label}: ${segment.value}`}
                >
                  <span
                    className="bai-share-bar__segment"
                    style={{
                      width: `${(segment.value / total) * 100}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                </Tooltip>
              ),
            )
          : null}
      </div>

      <div className="bai-share-bar__legend">
        {_.map(segments, (segment) => (
          <div className="bai-share-bar__item" key={segment.key}>
            <span
              className="bai-share-bar__dot"
              style={{ backgroundColor: segment.color }}
            />
            <Text color="secondary" maxLines={1}>
              {segment.label}
            </Text>
            <Text
              className="bai-share-bar__count"
              weight={segment.value > 0 ? 'semibold' : 'normal'}
              color={segment.value > 0 ? 'primary' : 'disabled'}
              hasTabularNumbers
            >
              {segment.value}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

BAIShareBar.displayName = 'BAIShareBar';
export default BAIShareBar;
