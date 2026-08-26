import BAILink from './BAILink';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// jsdom does not provide ResizeObserver; antd Typography.Text ellipsis tooltip needs it
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Helper to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('BAILink', () => {
  describe('Basic Rendering', () => {
    it('should render react-router Link with to prop', () => {
      renderWithRouter(<BAILink to="/test">Test Link</BAILink>);
      const link = screen.getByText('Test Link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render Typography.Link without to prop', () => {
      render(<BAILink>Test Link</BAILink>);
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('should render children as React elements', () => {
      renderWithRouter(
        <BAILink to="/test">
          <span data-testid="child-element">Complex Content</span>
        </BAILink>,
      );
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });
  });

  describe('Link Types', () => {
    it('should render react-router Link when type is "hover"', () => {
      renderWithRouter(
        <BAILink to="/test" type="hover">
          Hover Link
        </BAILink>,
      );
      const link = screen.getByText('Hover Link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('class');
    });

    it('should render Typography.Link when type is "disabled" even with to prop', () => {
      render(
        <BAILink type="disabled" to="/test">
          Disabled Link
        </BAILink>,
      );
      const link = screen.getByText('Disabled Link');
      // Disabled renders as Typography.Link (no href), not react-router Link
      expect(link).not.toHaveAttribute('href');
    });

    it('should render without explicit type when type is undefined', () => {
      renderWithRouter(<BAILink to="/test">Normal Link</BAILink>);
      const link = screen.getByText('Normal Link');
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Router Integration', () => {
    it('should accept object-style to prop', () => {
      renderWithRouter(
        <BAILink to={{ pathname: '/test', search: '?q=value' }}>
          Object Link
        </BAILink>,
      );
      const link = screen.getByText('Object Link');
      expect(link).toHaveAttribute('href', '/test?q=value');
    });

    it('should render Typography.Link when to prop is missing', () => {
      render(<BAILink>No To Prop</BAILink>);
      const link = screen.getByText('No To Prop');
      expect(link).not.toHaveAttribute('href');
    });
  });

  describe('Ellipsis', () => {
    it('should apply ellipsis when ellipsis is true', () => {
      render(
        <BAILink ellipsis={true}>Long text that should be ellipsed</BAILink>,
      );
      expect(
        screen.getByText('Long text that should be ellipsed'),
      ).toBeInTheDocument();
    });

    it('should render with tooltip ellipsis config', () => {
      render(
        <BAILink ellipsis={{ tooltip: 'Full text here' }}>
          Truncated text
        </BAILink>,
      );
      expect(screen.getByText('Truncated text')).toBeInTheDocument();
    });

    it('should render children without ellipsis when ellipsis is false', () => {
      render(<BAILink ellipsis={false}>No ellipsis</BAILink>);
      expect(screen.getByText('No ellipsis')).toBeInTheDocument();
    });

    /*
     * FR-3686. jsdom does not lay out, so overflow cannot be measured here;
     * these pin the DOM CONTRACT the fix depends on — the truncating box lives
     * INSIDE the link (an ancestor can neither shorten an atomic inline box nor
     * see a child that fits it), and the link carries the width cap that bounds
     * it. Both are load-bearing and both are invisible to a render-only assert.
     */
    it.each([
      ['onClick (Astryx Link)', undefined],
      ['to (router link)', '/test'],
    ])('puts the truncating text inside the link — %s', (_label, to) => {
      renderWithRouter(
        <BAILink to={to} ellipsis data-testid="link">
          Some long name
        </BAILink>,
      );
      const link = screen.getByTestId('link');
      expect(link).toHaveClass('bai-link-ellipsis');
      const text = link.querySelector('.astryx-text');
      expect(text).not.toBeNull();
      expect(link).toContainElement(text as HTMLElement);
      expect(screen.getByText('Some long name')).toBeInTheDocument();
    });

    it('keeps the caller class alongside the internal ones', () => {
      renderWithRouter(
        <BAILink to="/test" ellipsis className="caller" data-testid="link">
          Name
        </BAILink>,
      );
      const link = screen.getByTestId('link');
      // The spread must not overwrite the internal classes, or the width cap
      // disappears and truncation silently stops working.
      expect(link).toHaveClass('caller');
      expect(link).toHaveClass('bai-link-ellipsis');
      expect(link).toHaveClass('bai-link-hover');
    });

    it('keeps the custom-tooltip form addressable on the truncating box', () => {
      render(
        <BAILink ellipsis={{ tooltip: 'Full text here' }} data-testid="link">
          Truncated text
        </BAILink>,
      );
      const link = screen.getByTestId('link');
      // The custom tooltip is gated on the truncating box's own overflow, so
      // that box has to be the one inside the link — not an ancestor of it.
      expect(link).toHaveClass('bai-link-ellipsis');
      expect(link.querySelector('.astryx-text')).not.toBeNull();
    });

    /*
     * FR-3692. Astryx `Text` resolves `color ?? 'primary'` and paints it on its
     * OWN element, so the truncating box FR-3686 moved inside the link would
     * repaint the link body text unless it is told to inherit. jsdom computes
     * no StyleX CSS, so this asserts the reflected `data-color` Astryx emits
     * from the same resolved value.
     */
    it.each([
      ['onClick (Astryx Link)', undefined],
      ['to (router link)', '/test'],
    ])('lets the link keep its own colour — %s', (_label, to) => {
      renderWithRouter(
        <BAILink to={to} ellipsis data-testid="link">
          Some long name
        </BAILink>,
      );
      const texts = screen.getByTestId('link').querySelectorAll('.astryx-text');
      // The innermost one owns the text, so it is the one that must inherit.
      expect(texts[texts.length - 1]).toHaveAttribute('data-color', 'inherit');
    });
  });

  describe('onClick Handler', () => {
    it('should call onClick handler when clicked on react-router Link', async () => {
      const onClick = vi.fn((e) => e.preventDefault());
      const user = userEvent.setup();
      renderWithRouter(
        <BAILink to="/test" onClick={onClick}>
          Clickable Link
        </BAILink>,
      );

      await user.click(screen.getByText('Clickable Link'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler when clicked on Typography.Link', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<BAILink onClick={onClick}>Clickable Typography Link</BAILink>);

      await user.click(screen.getByText('Clickable Typography Link'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should mark a disabled link as non-interactive', () => {
      const onClick = vi.fn();
      render(
        <BAILink type="disabled" onClick={onClick}>
          Disabled Link
        </BAILink>,
      );

      // Astryx `Link` renders its children inside a `Text` span, so the text
      // node is one level below the element that owns the class (phase 3,
      // ticket A). `closest` re-anchors the query (P7).
      const link = screen.getByText('Disabled Link').closest('a, button');
      // This used to click the link and assert that userEvent refused because
      // of `pointer-events: none`. That assertion only worked while the rule
      // was injected at runtime by antd-style's emotion cache: to-astryx
      // ticket 33 moved it into BAILink.css, and Vite stubs `.css` imports
      // under vitest, so jsdom never sees the declaration. What the component
      // actually owns is the class — assert that, and let BAILink.css own the
      // pointer-events rule.
      expect(link).toHaveClass('bai-link-disabled');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Props Passthrough', () => {
    it('should pass through LinkProps to react-router Link', () => {
      renderWithRouter(
        <BAILink to="/test" className="custom-class" data-testid="custom-link">
          Custom Link
        </BAILink>,
      );
      const link = screen.getByTestId('custom-link');
      expect(link).toHaveClass('custom-class');
    });

    it('should pass through LinkProps to Typography.Link', () => {
      render(
        <BAILink className="typography-custom" data-testid="typography-link">
          Typography Link
        </BAILink>,
      );
      const link = screen.getByTestId('typography-link');
      expect(link).toHaveClass('typography-custom');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      renderWithRouter(<BAILink to="/test">{''}</BAILink>);
      expect(screen.queryByRole('link')).toBeInTheDocument();
    });

    it('should handle null children', () => {
      renderWithRouter(<BAILink to="/test">{null}</BAILink>);
      expect(screen.queryByRole('link')).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      renderWithRouter(
        <BAILink to="/test">
          <div>
            <span>Nested</span>
            <span>Content</span>
          </div>
        </BAILink>,
      );
      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Multiple Links', () => {
    it('should render multiple links independently', () => {
      renderWithRouter(
        <>
          <BAILink to="/link1">Link 1</BAILink>
          <BAILink to="/link2" type="hover">
            Link 2
          </BAILink>
          <BAILink type="disabled">Link 3</BAILink>
        </>,
      );
      expect(screen.getByText('Link 1')).toHaveAttribute('href', '/link1');
      expect(screen.getByText('Link 2')).toHaveAttribute('href', '/link2');
      // Disabled link renders as Typography.Link without href
      expect(screen.getByText('Link 3')).not.toHaveAttribute('href');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible for react-router Link', async () => {
      const onClick = vi.fn((e) => e.preventDefault());
      const user = userEvent.setup();
      renderWithRouter(
        <BAILink to="/test" onClick={onClick}>
          Keyboard Link
        </BAILink>,
      );

      const link = screen.getByText('Keyboard Link');
      link.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalled();
    });

    it('should call onClick for Typography.Link on click', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<BAILink onClick={onClick}>Typography Click</BAILink>);

      await user.click(screen.getByText('Typography Click'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should have disabled state when type is disabled', () => {
      render(<BAILink type="disabled">Disabled Link</BAILink>);

      const link = screen.getByText('Disabled Link').closest('a, button');
      // Astryx `Link isDisabled` renders an href-less <a> that is out of the
      // tab order and announces `aria-disabled` (its own docs); that pair is
      // the contract now, not antd's `ant-typography-disabled` class.
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('tabindex', '-1');
      expect(link).toHaveClass('bai-link-disabled');
    });
  });
});
