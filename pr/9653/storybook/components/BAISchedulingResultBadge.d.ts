import { SemanticColor } from '../helper';
import { BAIBadgeProps } from './BAIBadge';
export type SchedulingResult = 'SUCCESS' | 'FAILURE' | 'STALE' | 'NEED_RETRY' | 'EXPIRED' | 'GIVE_UP' | 'SKIPPED';
export interface BAISchedulingResultBadgeProps extends Omit<BAIBadgeProps, 'text' | 'color'> {
    result: SchedulingResult | null;
}
/**
 * The one semantic mapping for a scheduling result. Exported so anything that
 * draws a result alongside the badge (the sub-step timeline's rail dots) picks
 * the same colour instead of inventing a second language.
 */
export declare const resultSemanticColorMap: Record<SchedulingResult, SemanticColor>;
declare const BAISchedulingResultBadge: ({ result, ...badgeProps }: BAISchedulingResultBadgeProps) => import("react").JSX.Element;
export default BAISchedulingResultBadge;
