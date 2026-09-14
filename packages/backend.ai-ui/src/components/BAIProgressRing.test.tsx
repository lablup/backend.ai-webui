/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIProgressRing, {
  BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT,
  BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT,
} from './BAIProgressRing';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const CIRCUMFERENCE = 2 * Math.PI * 6;
const dashOffsetFor = (percent: number) => CIRCUMFERENCE * (1 - percent / 100);
const arcDashOffset = (container: HTMLElement) =>
  Number(
    container
      .querySelector('.bai-progress-ring-arc')
      ?.getAttribute('stroke-dashoffset'),
  );

// FR-3923: the ring replaces a bare spinning glyph, so the value it carries
// has to reach assistive technology — and the "value unknown" case has to stay
// as silent as the glyph was.
describe('BAIProgressRing', () => {
  it('exposes a determinate ring as a progressbar carrying its value', () => {
    render(<BAIProgressRing percent={99} />);

    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveAttribute('aria-valuenow', '99');
    expect(ring).toHaveAttribute('aria-valuemin', '0');
    expect(ring).toHaveAttribute('aria-valuemax', '100');
    expect(ring).toHaveAttribute('aria-valuetext', '99%');
  });

  it('renders no progressbar and no value when percent is unknown', () => {
    const { container } = render(<BAIProgressRing />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).not.toHaveAttribute('aria-valuenow');
    expect(svg).toHaveClass('bai-progress-ring-indeterminate');
  });

  it('names the indeterminate ring when the caller supplies one', () => {
    render(<BAIProgressRing aria-label="Terminating" />);

    expect(screen.getByRole('img', { name: 'Terminating' })).toBeVisible();
  });

  it('clamps a value below 0 and above 100', () => {
    const { rerender } = render(<BAIProgressRing percent={-20} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );

    rerender(<BAIProgressRing percent={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('treats a non-finite percent as unknown', () => {
    render(<BAIProgressRing percent={NaN} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('keeps a visible arc and a visible gap at 0% and 100%', () => {
    const { container, rerender } = render(<BAIProgressRing percent={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(arcDashOffset(container)).toBeCloseTo(
      dashOffsetFor(BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT),
      5,
    );

    rerender(<BAIProgressRing percent={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuetext',
      '100%',
    );
    expect(arcDashOffset(container)).toBeCloseTo(
      dashOffsetFor(BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT),
      5,
    );
  });

  it('draws the true value between the two bounds', () => {
    const { container } = render(<BAIProgressRing percent={50} />);

    expect(arcDashOffset(container)).toBeCloseTo(dashOffsetFor(50), 5);
  });

  // `stroke-linecap: round` adds strokeWidth / 2 past each end of the dash, so
  // the drawn gap is shorter than the undrawn dash by a whole strokeWidth.
  it('leaves the round caps a gap to not swallow at the top of the range', () => {
    const drawn = (CIRCUMFERENCE * BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT) / 100;
    const strokeWidth = 2;

    expect(CIRCUMFERENCE - drawn - strokeWidth).toBeGreaterThanOrEqual(3);
  });

  it('drops the slow rotation when rotate is false', () => {
    const { container } = render(
      <BAIProgressRing percent={50} rotate={false} />,
    );

    expect(container.querySelector('svg')).not.toHaveClass(
      'bai-progress-ring-spin',
    );
  });
});
