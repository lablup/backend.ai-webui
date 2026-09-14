/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIKernelProgressBreakdown from './BAIKernelProgressBreakdown';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// FR-3924: the popover behind the session status ring. The component counts
// nothing, so what is asserted here is that every bucket it is handed reaches
// the reader — including the zero ones — and that the bar cannot overflow.
const TERMINATING_SEGMENTS = [
  { status: 'TERMINATED', count: 119 },
  { status: 'TERMINATING', count: 1 },
  { status: 'RUNNING', count: 0 },
];

describe('BAIKernelProgressBreakdown', () => {
  it('shows the phase title and the done/total fraction', () => {
    render(
      <BAIKernelProgressBreakdown
        phase="terminating"
        total={120}
        done={119}
        segments={TERMINATING_SEGMENTS}
      />,
    );

    expect(screen.getByText('Kernel termination progress')).toBeVisible();
    expect(screen.getByText('119 / 120')).toBeVisible();
  });

  it('titles the creating phase differently', () => {
    render(
      <BAIKernelProgressBreakdown
        phase="creating"
        total={4}
        done={1}
        segments={[
          { status: 'RUNNING', count: 1 },
          { status: 'CREATING', count: 3 },
        ]}
      />,
    );

    expect(screen.getByText('Kernel startup progress')).toBeVisible();
  });

  it('renders one legend row per segment, zero-count rows included', () => {
    render(
      <BAIKernelProgressBreakdown
        phase="terminating"
        total={120}
        done={119}
        segments={TERMINATING_SEGMENTS}
      />,
    );

    TERMINATING_SEGMENTS.forEach(({ status, count }) => {
      expect(screen.getByText(status)).toBeVisible();
      expect(screen.getByText(String(count))).toBeVisible();
    });
  });

  it('draws a bar segment only for non-empty buckets, summing to at most 100%', () => {
    const { container } = render(
      <BAIKernelProgressBreakdown
        phase="terminating"
        total={120}
        done={119}
        segments={TERMINATING_SEGMENTS}
      />,
    );

    const segments = Array.from(
      container.querySelectorAll<HTMLElement>(
        '.bai-kernel-progress-breakdown-segment',
      ),
    );
    expect(segments).toHaveLength(2);

    const widths = segments.map((segment) =>
      Number.parseFloat(segment.style.width),
    );
    expect(widths.reduce((sum, width) => sum + width, 0)).toBeLessThanOrEqual(
      100,
    );
  });

  it('colours each bucket with the session badge variant of its status', () => {
    const { container } = render(
      <BAIKernelProgressBreakdown
        phase="terminating"
        total={120}
        done={119}
        segments={TERMINATING_SEGMENTS}
      />,
    );

    expect(
      container.querySelector(
        '.bai-kernel-progress-breakdown-segment[data-variant="neutral"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '.bai-kernel-progress-breakdown-segment[data-variant="warning"]',
      ),
    ).toBeInTheDocument();
  });

  it('keeps every segment inside the track when the buckets do not fill the cluster', () => {
    const { container } = render(
      <BAIKernelProgressBreakdown
        phase="creating"
        total={10}
        done={2}
        segments={[{ status: 'RUNNING', count: 2 }]}
      />,
    );

    const segment = container.querySelector<HTMLElement>(
      '.bai-kernel-progress-breakdown-segment',
    );
    expect(segment?.style.width).toBe('20%');
  });
});
