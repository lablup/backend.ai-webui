/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The adapter's mapping onto ui-common `Statistic`; the component's own
 behaviour is tested in ui-common.
*/
import BAIStatistic from './BAIStatistic';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

const bar = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[role="progressbar"]');

describe('BAIStatistic', () => {
  it('maps title and current onto the caption and the value', () => {
    render(<BAIStatistic title="Memory" current={512} unit="MB" />);
    expect(screen.getByText('Memory')).toBeInTheDocument();
    expect(screen.getByText('512')).toBeInTheDocument();
    expect(screen.getByText('MB')).toBeInTheDocument();
  });

  it('draws no bar by default', () => {
    const { container } = render(
      <BAIStatistic title="CPU" current={4} total={8} />,
    );
    expect(bar(container)).toBeNull();
  });

  it('maps progressMode="normal" onto a visible bar', () => {
    const { container } = render(
      <BAIStatistic title="CPU" current={4} total={8} progressMode="normal" />,
    );
    expect(bar(container)).toHaveAttribute('aria-valuenow', '50');
    expect(
      container.querySelector('.uic-statistic__step--placeholder'),
    ).toBeNull();
  });

  it('maps progressMode="ghost" onto a placeholder bar', () => {
    const { container } = render(
      <BAIStatistic title="CPU" current={4} total={8} progressMode="ghost" />,
    );
    expect(bar(container)).toHaveAttribute('aria-valuenow', '0');
    expect(container.querySelector('.uic-statistic__step')).toHaveClass(
      'uic-statistic__step--placeholder',
    );
  });

  it('colours the value from style.color and keeps the style on the root', () => {
    const { container } = render(
      <BAIStatistic
        title="Colored"
        current={100}
        style={{ color: 'rgb(255, 0, 0)', backgroundColor: 'blue' }}
      />,
    );
    expect(screen.getByText('100')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(
      (container.firstElementChild as HTMLElement).style.backgroundColor,
    ).toBe('blue');
  });

  it('shows Unlimited for a non-finite value', () => {
    render(<BAIStatistic title="Usage" current={Infinity} />);
    expect(screen.getByText('Unlimited')).toBeInTheDocument();
  });
});
