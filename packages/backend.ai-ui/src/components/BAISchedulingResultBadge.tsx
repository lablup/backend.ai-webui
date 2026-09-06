import { SemanticColor } from '../helper';
import BAIBadge, { BAIBadgeProps } from './BAIBadge';
import * as _ from 'lodash-es';

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

/**
 * The one semantic mapping for a scheduling result. Exported so anything that
 * draws a result alongside the badge (the sub-step timeline's rail dots) picks
 * the same colour instead of inventing a second language.
 */
export const resultSemanticColorMap: Record<SchedulingResult, SemanticColor> = {
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
  const semanticColor = result
    ? _.get(resultSemanticColorMap, result)
    : undefined;

  return (
    <BAIBadge
      {...badgeProps}
      color={semanticColor}
      text={result}
      style={{ whiteSpace: 'nowrap', ...badgeProps.style }}
    />
  );
};

export default BAISchedulingResultBadge;
