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

    it('should block click interaction when link is disabled', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(
        <BAILink type="disabled" onClick={onClick}>
          Disabled Link
        </BAILink>,
      );

      const link = screen.getByText('Disabled Link');
      // userEvent respects pointer-events: none and blocks the click
      await expect(user.click(link)).rejects.toThrow(/pointer-events/);
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

    it('should call onClick for Typography.Link on click', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<BAILink onClick={onClick}>Typography Click</BAILink>);

      await user.click(screen.getByText('Typography Click'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should have disabled state when type is disabled', () => {
      render(<BAILink type="disabled">Disabled Link</BAILink>);

      const link = screen.getByText('Disabled Link');
      // Ant Design adds ant-typography-disabled class for disabled Typography.Link
      expect(link).toHaveClass('ant-typography-disabled');
    });
  });
});
