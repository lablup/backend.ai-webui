/*
 FR-3706: the count pill next to a tab label carries the ACTIVE MENU GROUP's
 primary, and the three call sites (Sessions / Data / Admin Sessions) must not
 drift apart again.

 jsdom resolves no custom properties, so the colour itself is not assertable
 here — it is measured on the running app and recorded in the PR. What IS
 assertable, and what the regression actually was, is that the selected state
 routes through the accent CLASS rather than a hardcoded `Badge.variant`.
*/
import BAITabCountBadge from './BAITabCountBadge';
import { render } from '@testing-library/react';

const badgeOf = (container: HTMLElement) =>
  container.querySelector('.astryx-badge');

describe('BAITabCountBadge', () => {
  describe('visibility', () => {
    it('should render nothing when count is undefined', () => {
      const { container } = render(<BAITabCountBadge />);
      expect(badgeOf(container)).not.toBeInTheDocument();
    });

    it('should render nothing when count is 0', () => {
      const { container } = render(<BAITabCountBadge count={0} />);
      expect(badgeOf(container)).not.toBeInTheDocument();
    });

    it('should render a 0 when showZero is set', () => {
      const { container } = render(<BAITabCountBadge count={0} showZero />);
      expect(badgeOf(container)).toHaveTextContent('0');
    });

    it('should render the count when it is positive', () => {
      const { container } = render(<BAITabCountBadge count={7} />);
      expect(badgeOf(container)).toHaveTextContent('7');
    });
  });

  describe('accent routing', () => {
    it('should carry the accent class only when selected', () => {
      const { container: unselected } = render(<BAITabCountBadge count={3} />);
      expect(badgeOf(unselected)).toHaveClass('bai-tab-count-badge');
      expect(badgeOf(unselected)).not.toHaveClass(
        'bai-tab-count-badge--selected',
      );

      const { container: selected } = render(
        <BAITabCountBadge count={3} selected />,
      );
      expect(badgeOf(selected)).toHaveClass('bai-tab-count-badge--selected');
    });

    it('should not pin a coloured Badge variant for the selected state', () => {
      // The regression: `variant="green"` / `variant="info"` are fixed hues
      // that cannot follow AstryxAdminTheme. Neutral + the class is the fix.
      const { container } = render(<BAITabCountBadge count={3} selected />);
      expect(badgeOf(container)).toHaveAttribute('data-variant', 'neutral');
    });
  });
});
