import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIKernelProgressSegment {
    /** Kernel status the bucket carries, already collapsed by the caller. */
    status: string;
    /** Kernels in the bucket. `0` still renders, muted. */
    count: number;
}
export interface BAIKernelProgressBreakdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    /** Which way the kernel set is moving; picks the title. */
    phase: 'creating' | 'terminating';
    /** Kernels the session is expected to have — the bar's denominator. */
    total: number;
    /** Kernels that have reached the phase's target status. */
    done: number;
    /** Buckets in display order; the done bucket comes first. */
    segments: ReadonlyArray<BAIKernelProgressSegment>;
}
/**
 * The per-kernel reading behind a session's progress ring: how many kernels
 * have arrived, a stacked bar of where the rest are, and a legend naming each
 * colour. Purely presentational — the caller groups, orders and counts.
 *
 * ```tsx
 * <BAIKernelProgressBreakdown
 *   phase="terminating"
 *   done={119}
 *   total={120}
 *   segments={[
 *     { status: 'TERMINATED', count: 119 },
 *     { status: 'TERMINATING', count: 1 },
 *     { status: 'RUNNING', count: 0 },
 *   ]}
 * />
 * ```
 */
declare const BAIKernelProgressBreakdown: React.FC<BAIKernelProgressBreakdownProps>;
export default BAIKernelProgressBreakdown;
