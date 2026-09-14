/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIProgressRing from './BAIProgressRing';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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

  it('empties the arc at 0% and closes it at 100%', () => {
    const { container, rerender } = render(<BAIProgressRing percent={0} />);
    const arcAtZero = container.querySelector('.bai-progress-ring-arc');
    const circumference = 2 * Math.PI * 6;
    expect(Number(arcAtZero?.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      circumference,
      5,
    );

    rerender(<BAIProgressRing percent={100} />);
    const arcAtFull = container.querySelector('.bai-progress-ring-arc');
    expect(Number(arcAtFull?.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      0,
      5,
    );
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
