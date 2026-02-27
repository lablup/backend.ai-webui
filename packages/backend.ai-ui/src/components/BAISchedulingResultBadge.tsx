import { SemanticColor, useSemanticColorMap } from '../helper';
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

const resultSemanticMap: Record<SchedulingResult, SemanticColor> = {
  SUCCESS: 'success',
  FAILURE: 'error',
  STALE: 'default',
  NEED_RETRY: 'warning',
  EXPIRED: 'error',
  GIVE_UP: 'error',
  SKIPPED: 'default',
} as const;

const BAISchedulingResultBadge = ({
  result,
  ...badgeProps
}: BAISchedulingResultBadgeProps) => {
  'use memo';
  const semanticColorMap = useSemanticColorMap();
  const semanticColor = result ? _.get(resultSemanticMap, result) : undefined;

  return (
    <BAIFlex gap={'xs'} wrap="nowrap" align="center">
      <Badge
        {...badgeProps}
        color={semanticColor ? semanticColorMap[semanticColor] : undefined}
      />
      &nbsp;{result}
    </BAIFlex>
  );
};

export default BAISchedulingResultBadge;
