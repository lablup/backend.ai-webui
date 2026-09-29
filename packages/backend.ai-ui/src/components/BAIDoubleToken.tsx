import type { AstryxTokenColor } from '../helper/astryxTagVariant';
import './BAIDoubleToken.css';
import BAIText from './BAIText';
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
  /** Appends the shared copy control (`BAIText copyable`) to this segment. */
  copyable?: boolean;
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
  const hasHighlight = !_.isUndefined(highlightKeyword);

  return (
    <HStack gap={0} align="center" className="bai-double">
      {_.map(objectValues, (objValue, idx) => {
        if (_.isEmpty(objValue.label)) return null;
        // Token.label is string-only: a highlight or a copy control renders
        // through a hidden label + endContent, which keeps the plain string
        // as the accessible name.
        const visibleLabel = hasHighlight ? (
          <BAITextHighlighter keyword={highlightKeyword}>
            {objValue.label}
          </BAITextHighlighter>
        ) : (
          objValue.label
        );
        const endContent = objValue.copyable ? (
          <BAIText copyable={{ text: objValue.label }} inheritColor>
            {visibleLabel}
          </BAIText>
        ) : hasHighlight ? (
          visibleLabel
        ) : undefined;
        return (
          <Token
            key={idx}
            color={objValue.color ?? 'blue'}
            label={objValue.label}
            isLabelHidden={!_.isUndefined(endContent)}
            endContent={endContent}
          />
        );
      })}
    </HStack>
  );
};

export default BAIDoubleToken;
