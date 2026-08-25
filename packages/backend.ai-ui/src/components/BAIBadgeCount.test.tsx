import BAIBadgeCount from './BAIBadgeCount';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

// `className` lands on the WRAPPER, which is what lets a call site scope a rule
// at the overlay (FR-3610: undoing an inverted band's `color-scheme` on the
// badge). jsdom cannot compute `color-scheme`, so the selector shape is the part
// worth pinning.
describe('BAIBadgeCount', () => {
  it('puts className on the wrapper, an ancestor of the overlay', () => {
    const { container } = render(
      <BAIBadgeCount className="scoping-hook" hasDot variant="error">
        <span>anchor</span>
      </BAIBadgeCount>,
    );

    expect(
      container.querySelector('.scoping-hook .bai-badge-count-overlay'),
    ).toBeInTheDocument();
    expect(container.querySelector('.scoping-hook')).toHaveClass(
      'bai-badge-count',
    );
  });

  it('renders no overlay when there is nothing to show', () => {
    const { container } = render(
      <BAIBadgeCount className="scoping-hook">
        <span>anchor</span>
      </BAIBadgeCount>,
    );

    expect(
      container.querySelector('.bai-badge-count-overlay'),
    ).not.toBeInTheDocument();
  });
});
