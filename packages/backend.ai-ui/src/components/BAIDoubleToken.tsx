/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 ui-common `DoubleToken` under its BUI name (FR-4096): a welded run of Tokens
 for a settled pair; the live counterpart is `BAIDoubleBadge`.
*/
import BAIText from './BAIText';
import BAITextHighlighter from './BAITextHighlighter';
import {
  DoubleToken,
  type DoubleTokenProps,
  type DoubleTokenValue,
} from '@lablup/ui-common/components/DoubleToken';
import React from 'react';

export type BAIDoubleTokenValue = DoubleTokenValue & {
  /** Appends the shared copy control (`BAIText copyable`) to this segment. */
  copyable?: boolean;
};

export interface BAIDoubleTokenProps extends Omit<DoubleTokenProps, 'values'> {
  values?: Array<string> | Array<BAIDoubleTokenValue>;
}

const BAIDoubleToken: React.FC<BAIDoubleTokenProps> = ({
  values,
  highlightKeyword,
  ...props
}) => {
  'use memo';
  return (
    <DoubleToken
      {...props}
      highlightKeyword={highlightKeyword}
      values={
        values?.map((value) => {
          if (typeof value === 'string') return value;
          const { copyable, ...rest } = value;
          if (!copyable || rest.endContent !== undefined) return rest;
          // `endContent` replaces the visible label and the highlight does
          // not reach into it, so the label is highlighted here.
          return {
            ...rest,
            endContent: (
              <BAIText copyable={{ text: rest.label }} inheritColor>
                {highlightKeyword !== undefined ? (
                  <BAITextHighlighter keyword={highlightKeyword}>
                    {rest.label}
                  </BAITextHighlighter>
                ) : (
                  rest.label
                )}
              </BAIText>
            ),
          };
        }) as DoubleTokenProps['values']
      }
    />
  );
};

export default BAIDoubleToken;
