import { badgeVariantForTagColor } from '../helper/astryxTagVariant';
import './BAIDoubleTag.css';
import BAITextHighlighter from './BAITextHighlighter';
import { Badge } from '@astryxdesign/core/Badge';
import { HStack } from '@astryxdesign/core/Stack';
import * as _ from 'lodash-es';
import React from 'react';

// Frontier note (astryx migration, ticket 19): the public prop surface keeps
// its antd shape (`color?: string`, antd preset names) for unmigrated
// consumers; internally the tags render as Astryx Badges through the
// repo-global Tag lookup (ticket 13 policy — unknown runtime strings drop to
// neutral).
//
// The pair is welded in BAIDoubleTag.css: Badge's radius is theme-owned and
// adjacency-conditional styling has no prop or defineTheme route (FR-3687).
//
// PILOT-DECISION: the 150px max-width ellipsis + tooltip on each segment is
// dropped (Astryx Text cannot be width-capped inside a Badge without xstyle);
// tag labels render in full (simplicity policy, MIGRATION-SPEC §0).
export type DoubleTagObjectValue = {
  label: string;
  color?: string;
  style?: React.CSSProperties;
};

export interface BAIDoubleTagProps {
  values?: Array<string> | Array<DoubleTagObjectValue>;
  highlightKeyword?: string;
}

const BAIDoubleTag: React.FC<BAIDoubleTagProps> = ({
  values = [],
  highlightKeyword,
}) => {
  if (values.length === 0) return null;
  let objectValues: Array<DoubleTagObjectValue>;
  if (
    values[0] &&
    (typeof values[0] === 'string' || React.isValidElement(values[0]))
  ) {
    objectValues = values.map(
      (value) =>
        ({
          label: value,
          color: 'blue',
        }) as DoubleTagObjectValue,
    );
  } else {
    objectValues = values as DoubleTagObjectValue[];
  }

  return (
    <HStack gap={0} align="center" className="bai-double-tag">
      {_.map(objectValues, (objValue, idx) =>
        !_.isEmpty(objValue.label) ? (
          <Badge
            key={idx}
            variant={badgeVariantForTagColor(objValue.color)}
            label={
              !_.isUndefined(highlightKeyword) ? (
                <BAITextHighlighter keyword={highlightKeyword}>
                  {objValue.label}
                </BAITextHighlighter>
              ) : (
                objValue.label
              )
            }
          />
        ) : null,
      )}
    </HStack>
  );
};

export default BAIDoubleTag;
