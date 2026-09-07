/*
 FR-3715: the `admin` / main-access-key badges used to be a fixed green
 (`PRIMARY_TAG_VARIANT`), which both missed the brand accent and made the
 `admin` badge indistinguishable from the green `user` badge next to it.
 jsdom resolves no custom properties, so the colour itself is measured on the
 running app; what is assertable is that the accent routes through the CLASS
 and no coloured Badge variant is pinned.
*/
import BAIAccentBadge from './BAIAccentBadge';
import { render } from '@testing-library/react';

const badgeOf = (container: HTMLElement) =>
  container.querySelector('.astryx-badge');

describe('BAIAccentBadge', () => {
  it('should render its label', () => {
    const { container } = render(<BAIAccentBadge label="admin" />);
    expect(badgeOf(container)).toHaveTextContent('admin');
  });

  it('should carry the accent class', () => {
    const { container } = render(<BAIAccentBadge label="admin" />);
    expect(badgeOf(container)).toHaveClass('bai-accent-badge');
  });

  it('should keep a caller className alongside its own', () => {
    const { container } = render(
      <BAIAccentBadge label="admin" className="custom" />,
    );
    expect(badgeOf(container)).toHaveClass('bai-accent-badge');
    expect(badgeOf(container)).toHaveClass('custom');
  });

  it('should not pin a coloured Badge variant', () => {
    const { container } = render(<BAIAccentBadge label="admin" />);
    expect(badgeOf(container)).toHaveAttribute('data-variant', 'neutral');
  });
});
