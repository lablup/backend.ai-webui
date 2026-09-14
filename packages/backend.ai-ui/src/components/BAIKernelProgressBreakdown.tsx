/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { badgeVariantForStatus } from '../helper/astryxTagVariant';
import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import './BAIKernelProgressBreakdown.css';
import { Text } from '@astryxdesign/core/Text';
import classNames from 'classnames';
import React from 'react';

export interface BAIKernelProgressSegment {
  /** Kernel status the bucket carries, already collapsed by the caller. */
  status: string;
  /** Kernels in the bucket. `0` still renders, muted. */
  count: number;
}

export interface BAIKernelProgressBreakdownProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /** Which way the kernel set is moving; picks the title. */
  phase: 'creating' | 'terminating';
  /** Kernels the session is expected to have — the bar's denominator. */
  total: number;
  /** Kernels that have reached the phase's target status. */
  done: number;
  /** Buckets in display order; the done bucket comes first. */
  segments: ReadonlyArray<BAIKernelProgressSegment>;
}

// The words are kernel statuses, but they are coloured through the SESSION
// domain: the `kernel` domain paints PENDING and RUNNING the same green, which
// is unreadable once both sit in one bar, and the badge this hangs off is a
// session badge.
const variantOf = (status: string) => badgeVariantForStatus('session', status);

const widthPercent = (count: number, total: number) =>
  total > 0 ? Math.max(0, Math.min(100, (count / total) * 100)) : 0;

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
const BAIKernelProgressBreakdown: React.FC<BAIKernelProgressBreakdownProps> = ({
  phase,
  total,
  done,
  segments,
  className,
  ...rest
}) => {
  'use memo';
  const { t } = useBAIi18n();

  const title =
    phase === 'terminating'
      ? t('comp:BAIKernelProgressBreakdown.KernelTerminationProgress')
      : t('comp:BAIKernelProgressBreakdown.KernelStartupProgress');

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="xs"
      className={classNames('bai-kernel-progress-breakdown', className)}
      role="group"
      aria-label={title}
      {...rest}
    >
      <BAIFlex justify="between" align="center" gap="md">
        <Text type="label">{title}</Text>
        <Text type="label" hasTabularNumbers>{`${done} / ${total}`}</Text>
      </BAIFlex>
      {/* Astryx has no segmented bar — ProgressBar carries one value — so the
          track is drawn here (P17) from declared tokens. */}
      <div className="bai-kernel-progress-breakdown-bar">
        {segments
          .filter((segment) => segment.count > 0)
          .map((segment) => (
            <div
              key={segment.status}
              className="bai-kernel-progress-breakdown-segment"
              data-variant={variantOf(segment.status)}
              data-testid={`kernel-progress-segment-${segment.status}`}
              style={{ width: `${widthPercent(segment.count, total)}%` }}
            />
          ))}
      </div>
      <BAIFlex direction="column" align="stretch" gap="xxs">
        {segments.map((segment) => {
          const isEmpty = segment.count <= 0;
          return (
            <BAIFlex
              key={segment.status}
              justify="between"
              align="center"
              gap="md"
            >
              <BAIFlex gap="xs" align="center">
                <span
                  className="bai-kernel-progress-breakdown-swatch"
                  data-variant={variantOf(segment.status)}
                  data-empty={isEmpty ? 'true' : undefined}
                />
                <Text
                  type="supporting"
                  color={isEmpty ? 'disabled' : 'primary'}
                >
                  {segment.status}
                </Text>
              </BAIFlex>
              <Text
                type="supporting"
                color={isEmpty ? 'disabled' : 'primary'}
                hasTabularNumbers
              >
                {segment.count}
              </Text>
            </BAIFlex>
          );
        })}
      </BAIFlex>
    </BAIFlex>
  );
};

export default BAIKernelProgressBreakdown;
