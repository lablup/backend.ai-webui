import type { AstryxBadgeVariant } from '../helper/astryxTagVariant';
import './BAIDoubleToken.css';
import { Badge } from '@lablup/ui-common/Badge';
import { HStack } from '@lablup/ui-common/Stack';
import * as _ from 'lodash-es';
import React from 'react';

// A welded run of Badges for a live pair (status + detail, label + ticker);
// the settled counterpart is `BAIDoubleToken`. Weld CSS: BAIDoubleToken.css.
export type BAIDoubleBadgeValue = {
  label: string;
  variant?: AstryxBadgeVariant;
};

export interface BAIDoubleBadgeProps {
  values?: Array<string> | Array<BAIDoubleBadgeValue>;
}

const BAIDoubleBadge: React.FC<BAIDoubleBadgeProps> = ({ values = [] }) => {
  'use memo';
  if (values.length === 0) return null;
  const objectValues: Array<BAIDoubleBadgeValue> = _.map(
    values,
    (value: string | BAIDoubleBadgeValue): BAIDoubleBadgeValue =>
      typeof value === 'string' ? { label: value, variant: 'neutral' } : value,
  );

  return (
    <HStack gap={0} align="center" className="bai-double">
      {_.map(objectValues, (objValue, idx) =>
        !_.isEmpty(objValue.label) ? (
          <Badge
            key={idx}
            variant={objValue.variant ?? 'neutral'}
            label={objValue.label}
          />
        ) : null,
      )}
    </HStack>
  );
};

export default BAIDoubleBadge;
