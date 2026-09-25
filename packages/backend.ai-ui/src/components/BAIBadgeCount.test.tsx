import BAIBadgeCount from './BAIBadgeCount';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// The count overlay itself is ui-common's `CountBadge`; this pins the antd
// names the adapter maps onto it.
describe('BAIBadgeCount', () => {
  it('puts className on the wrapper, an ancestor of the overlay', () => {
    const { container } = render(
      <BAIBadgeCount className="scoping-hook" hasDot variant="error">
        <span>anchor</span>
      </BAIBadgeCount>,
    );

    expect(
      container.querySelector('.scoping-hook .uic-count-badge__overlay'),
    ).toBeInTheDocument();
  });

  it('maps showZero, size="small" and title', () => {
    render(
      <BAIBadgeCount count={0} showZero size="small" title="0 problems">
        <span>anchor</span>
      </BAIBadgeCount>,
    );

    const overlay = screen.getByRole('status', { name: '0 problems' });
    expect(overlay).toHaveTextContent('0');
    expect(overlay).toHaveClass('uic-count-badge__overlay--sm');
  });

  it('renders no overlay when there is nothing to show', () => {
    render(
      <BAIBadgeCount count={0}>
        <span>anchor</span>
      </BAIBadgeCount>,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
