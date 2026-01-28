import BAIFlex from './BAIFlex';
import { Badge, BadgeProps } from 'antd';
import _ from 'lodash';

export type SchedulingResult =
  | 'SUCCESS'
  | 'FAILURE'
  | 'STALE'
  | 'NEED_RETRY'
  | 'EXPIRED'
  | 'GIVE_UP'
  | 'SKIPPED';

export interface BAISchedulingResultBadgeProps extends Omit<
  BadgeProps,
  'text' | 'color'
> {
  result: SchedulingResult | null;
}

const resultColorMap: Record<SchedulingResult, string> = {
  SUCCESS: 'green',
  FAILURE: 'red',
  STALE: 'orange',
  NEED_RETRY: 'blue',
  EXPIRED: 'gold',
  GIVE_UP: 'volcano',
  SKIPPED: 'purple',
} as const;

const BAISchedulingResultBadge = ({
  result,
  ...badgeProps
}: BAISchedulingResultBadgeProps) => {
  'use memo';

  return (
    <BAIFlex gap={'xs'} wrap="nowrap" align="center">
      <Badge {...badgeProps} color={_.get(resultColorMap, result ?? '')} />
      &nbsp;{result}
    </BAIFlex>
  );
};

export default BAISchedulingResultBadge;
