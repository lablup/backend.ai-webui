import { SemanticColor } from '../helper';
import BAIBadge, { BAIBadgeProps } from './BAIBadge';
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
  BAIBadgeProps,
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
  const semanticColor = result ? _.get(resultSemanticMap, result) : undefined;

  return <BAIBadge {...badgeProps} color={semanticColor} text={result} />;
};

export default BAISchedulingResultBadge;
