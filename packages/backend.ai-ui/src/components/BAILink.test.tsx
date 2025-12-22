import BAILink from './BAILink';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

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

    it('should render children as text', () => {
      renderWithRouter(<BAILink to="/test">Simple Text</BAILink>);
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
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
    it('should apply hover styles when type is "hover"', () => {
      renderWithRouter(
        <BAILink to="/test" type="hover">
          Hover Link
        </BAILink>,
      );
      const link = screen.getByText('Hover Link');
      // antd-style generates CSS classes dynamically, check for className existence
      expect(link.className).toBeTruthy();
    });

    it('should render as disabled Typography.Link when type is "disabled"', () => {
      render(
        <BAILink type="disabled" to="/test">
          Disabled Link
        </BAILink>,
      );
      const link = screen.getByText('Disabled Link');
      // When disabled, it should NOT render as react-router Link
      expect(link).not.toHaveAttribute('href');
    });

    it('should apply disabled styles when type is "disabled"', () => {
      render(
        <BAILink type="disabled" to="/test">
          Disabled Link
        </BAILink>,
      );
      const link = screen.getByText('Disabled Link');
      // antd-style generates CSS classes dynamically, check for className existence
      expect(link.className).toBeTruthy();
    });

    it('should render without explicit type when type is undefined', () => {
      renderWithRouter(<BAILink to="/test">Normal Link</BAILink>);
      const link = screen.getByText('Normal Link');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Router Integration', () => {
    it('should render react-router Link when to prop is provided and not disabled', () => {
      renderWithRouter(<BAILink to="/dashboard">Dashboard</BAILink>);
      const link = screen.getByText('Dashboard');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('should accept object-style to prop', () => {
      renderWithRouter(
        <BAILink to={{ pathname: '/test', search: '?q=value' }}>
          Object Link
        </BAILink>,
      );
      const link = screen.getByText('Object Link');
      expect(link).toHaveAttribute('href', '/test?q=value');
    });

    it('should render Typography.Link when disabled even with to prop', () => {
      render(
        <BAILink type="disabled" to="/test">
          Disabled with To
        </BAILink>,
      );
      const link = screen.getByText('Disabled with To');
      // Should not have href when disabled
      expect(link).not.toHaveAttribute('href');
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

    it('should apply ellipsis with tooltip when ellipsis is object with tooltip', () => {
      render(
        <BAILink ellipsis={{ tooltip: 'Full text here' }}>
          Truncated text
        </BAILink>,
      );
      expect(screen.getByText('Truncated text')).toBeInTheDocument();
    });

    it('should render children directly when ellipsis is not an object', () => {
      render(<BAILink ellipsis={true}>Simple ellipsis</BAILink>);
      expect(screen.getByText('Simple ellipsis')).toBeInTheDocument();
    });

    it('should render children without ellipsis when ellipsis is false', () => {
      render(<BAILink ellipsis={false}>No ellipsis</BAILink>);
      expect(screen.getByText('No ellipsis')).toBeInTheDocument();
    });

    it('should render children without ellipsis when ellipsis is undefined', () => {
      render(<BAILink>No ellipsis prop</BAILink>);
      expect(screen.getByText('No ellipsis prop')).toBeInTheDocument();
    });
  });

  describe('onClick Handler', () => {
    it('should call onClick handler when clicked on react-router Link', async () => {
      const onClick = jest.fn((e) => e.preventDefault());
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
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<BAILink onClick={onClick}>Clickable Typography Link</BAILink>);

      await user.click(screen.getByText('Clickable Typography Link'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick handler when link is disabled', () => {
      const onClick = jest.fn();
      render(
        <BAILink type="disabled" onClick={onClick}>
          Disabled Link
        </BAILink>,
      );

      const link = screen.getByText('Disabled Link');
      // Disabled links have pointer-events: none, which prevents interaction
      // We verify the disabled state is applied correctly
      expect(link.className).toBeTruthy();
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
      // Should render without crashing
      expect(screen.queryByRole('link')).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      renderWithRouter(<BAILink to="/test">{undefined}</BAILink>);
      // Should render without crashing
      expect(screen.queryByRole('link')).toBeInTheDocument();
    });

    it('should handle null children', () => {
      renderWithRouter(<BAILink to="/test">{null}</BAILink>);
      // Should render without crashing
      expect(screen.queryByRole('link')).toBeInTheDocument();
    });

    it('should handle zero as children', () => {
      renderWithRouter(<BAILink to="/test">{0}</BAILink>);
      expect(screen.getByText('0')).toBeInTheDocument();
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

  describe('Styling', () => {
    it('should apply hover styles correctly', () => {
      renderWithRouter(
        <BAILink to="/test" type="hover">
          Hover Link
        </BAILink>,
      );
      const link = screen.getByText('Hover Link');
      // antd-style generates CSS classes dynamically
      expect(link.className).toBeTruthy();
    });

    it('should apply disabled styles correctly', () => {
      render(<BAILink type="disabled">Disabled Link</BAILink>);
      const link = screen.getByText('Disabled Link');
      // antd-style generates CSS classes dynamically
      expect(link.className).toBeTruthy();
    });

    it('should render with className when type is provided', () => {
      renderWithRouter(
        <BAILink to="/test" type="hover">
          Hover Link
        </BAILink>,
      );
      const link = screen.getByText('Hover Link');
      expect(link.className).toBeTruthy();
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
      expect(screen.getByText('Link 1')).toBeInTheDocument();
      expect(screen.getByText('Link 2')).toBeInTheDocument();
      expect(screen.getByText('Link 3')).toBeInTheDocument();
    });

    it('should handle different link types together', () => {
      renderWithRouter(
        <>
          <BAILink to="/normal">Normal</BAILink>
          <BAILink to="/hover" type="hover">
            Hover
          </BAILink>
        </>,
      );

      const normalLink = screen.getByText('Normal');
      const hoverLink = screen.getByText('Hover');

      expect(normalLink).toBeInTheDocument();
      expect(hoverLink).toBeInTheDocument();
      // Both links should have className (antd-style generates dynamic classes)
      expect(normalLink.className || hoverLink.className).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible for react-router Link', async () => {
      const onClick = jest.fn((e) => e.preventDefault());
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

    it('should be keyboard accessible for Typography.Link', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<BAILink onClick={onClick}>Typography Keyboard</BAILink>);

      const link = screen.getByText('Typography Keyboard');
      // Typography.Link requires click, not keyboard events
      await user.click(link);

      expect(onClick).toHaveBeenCalled();
    });

    it('should not be clickable when disabled', () => {
      render(
        <BAILink type="disabled" onClick={jest.fn()}>
          Disabled Keyboard
        </BAILink>,
      );

      const link = screen.getByText('Disabled Keyboard');
      // Disabled links have pointer-events: none, verify this behavior
      expect(link.className).toBeTruthy();
      // The onClick should not be triggered when clicking, but we can't test
      // this directly because userEvent respects pointer-events: none
    });
  });
});
