/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import TrendStat, { type TrendStatProps } from './TrendStat';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';

export interface StatRowItem extends TrendStatProps {
  key: string;
}

/** Equal-width stats that wrap under each other when the card is narrow; every count card draws its numbers with it. */
const StatRow: React.FC<{
  items: ReadonlyArray<StatRowItem>;
  /** Tighter columns that keep four small counts on one line in a 2-column card. */
  compact?: boolean;
}> = ({ items, compact }) => {
  'use memo';
  return (
    <BAIFlex
      direction="row"
      gap={compact ? 'md' : 'lg'}
      wrap="wrap"
      align="start"
    >
      {items.map(({ key, ...item }) => (
        <BAIFlex
          key={key}
          direction="column"
          align="stretch"
          style={{ flex: compact ? '1 1 80px' : '1 1 112px', minWidth: 0 }}
        >
          <TrendStat {...item} />
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default StatRow;
