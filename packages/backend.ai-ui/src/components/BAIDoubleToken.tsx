import type { AstryxTokenColor } from '../helper/astryxTagVariant';
import './BAIDoubleToken.css';
import BAITextHighlighter from './BAITextHighlighter';
import { HStack } from '@astryxdesign/core/Stack';
import { Token } from '@astryxdesign/core/Token';
import * as _ from 'lodash-es';
import React from 'react';

// A welded run of Tokens for a settled key/value pair; the live counterpart is
// `BAIDoubleBadge`. The weld is CSS in BAIDoubleToken.css.
export type BAIDoubleTokenValue = {
  label: string;
  color?: AstryxTokenColor;
};

export interface BAIDoubleTokenProps {
  values?: Array<string> | Array<BAIDoubleTokenValue>;
  highlightKeyword?: string;
}

const BAIDoubleToken: React.FC<BAIDoubleTokenProps> = ({
  values = [],
  highlightKeyword,
}) => {
  'use memo';
  if (values.length === 0) return null;
  const objectValues: Array<BAIDoubleTokenValue> = _.map(
    values,
    (value: string | BAIDoubleTokenValue): BAIDoubleTokenValue =>
      typeof value === 'string' ? { label: value, color: 'blue' } : value,
  );

  return (
    <HStack gap={0} align="center" className="bai-double">
      {_.map(objectValues, (objValue, idx) =>
        !_.isEmpty(objValue.label) ? (
          // Token.label is string-only: highlight through a hidden label +
          // endContent, which keeps the plain string as the accessible name.
          <Token
            key={idx}
            color={objValue.color ?? 'blue'}
            label={objValue.label}
            isLabelHidden={!_.isUndefined(highlightKeyword)}
            endContent={
              !_.isUndefined(highlightKeyword) ? (
                <BAITextHighlighter keyword={highlightKeyword}>
                  {objValue.label}
                </BAITextHighlighter>
              ) : undefined
            }
          />
        ) : null,
      )}
    </HStack>
  );
};

export default BAIDoubleToken;
