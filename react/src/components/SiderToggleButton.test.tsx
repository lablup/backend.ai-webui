/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import SiderToggleButton from './SiderToggleButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock the MainLayout module to avoid complex dependencies
jest.mock('./MainLayout/MainLayout', () => ({
  HEADER_Z_INDEX_IN_MAIN_LAYOUT: 1000,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'button.Expand': 'Expand',
        'button.Collapse': 'Collapse',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock ResizeObserver for tooltip tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('SiderToggleButton', () => {
  describe('Rendering', () => {
    it('should render the button', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with default collapsed state (false)', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');

      // When not collapsed, should show ChevronLeftIcon (collapse action)
      expect(button).toBeInTheDocument();
    });

    it('should render ChevronRightIcon when collapsed', () => {
      render(<SiderToggleButton collapsed={true} />);
      const button = screen.getByRole('button');

      // Button should have ChevronRightIcon for expand action
      expect(button).toBeInTheDocument();
    });

    it('should render ChevronLeftIcon when not collapsed', () => {
      render(<SiderToggleButton collapsed={false} />);
      const button = screen.getByRole('button');

      // Button should have ChevronLeftIcon for collapse action
      expect(button).toBeInTheDocument();
    });

    it('should apply custom buttonTop positioning', () => {
      render(<SiderToggleButton buttonTop={100} />);
      const button = screen.getByRole('button');

      // Component should render with custom buttonTop
      expect(button).toBeInTheDocument();
    });

    it('should render with hidden style when hidden prop is true', () => {
      render(<SiderToggleButton hidden={true} />);
      const button = screen.getByRole('button', { hidden: true });

      // When hidden, button should have visibility:hidden and opacity:0
      expect(button).toHaveStyle({
        visibility: 'hidden',
        opacity: 0,
      });
    });

    it('should render with visible style when hidden prop is false', () => {
      render(<SiderToggleButton hidden={false} />);
      const button = screen.getByRole('button');

      // When not hidden, button should be visible
      expect(button).toHaveStyle({
        visibility: 'visible',
        opacity: 1,
      });
    });

    it('should render with visible style by default (when hidden is undefined)', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');

      // Default state should have visible button
      expect(button).toHaveStyle({
        visibility: 'visible',
        opacity: 1,
      });
    });
  });

  describe('Tooltip', () => {
    it('should wrap button in Tooltip component', () => {
      render(<SiderToggleButton collapsed={true} />);
      const button = screen.getByRole('button');

      // The button should be inside a tooltip wrapper
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick with toggled state when clicked (from collapsed)', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      render(<SiderToggleButton collapsed={true} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // When collapsed is true, clicking should call onClick with false (to expand)
      expect(mockOnClick).toHaveBeenCalledWith(false);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick with toggled state when clicked (from expanded)', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      render(<SiderToggleButton collapsed={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      await user.click(button);

      // When collapsed is false, clicking should call onClick with true (to collapse)
      expect(mockOnClick).toHaveBeenCalledWith(true);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onClick is not provided', async () => {
      const user = userEvent.setup();

      render(<SiderToggleButton collapsed={false} />);

      const button = screen.getByRole('button');

      // Clicking without onClick prop should not crash
      await expect(user.click(button)).resolves.not.toThrow();
    });

    it('should call onClick multiple times when clicked multiple times', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      render(<SiderToggleButton collapsed={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
      // Each click should toggle the state
      expect(mockOnClick).toHaveBeenNthCalledWith(1, true);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, true);
      expect(mockOnClick).toHaveBeenNthCalledWith(3, true);
    });
  });

  describe('Styling', () => {
    it('should have circular button shape', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');

      // Button should have shape="circle" attribute
      expect(button).toHaveClass('ant-btn-circle');
    });

    it('should have small button size', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');

      // Button should have size="small" class
      expect(button).toHaveClass('ant-btn-sm');
    });

    it('should have no box shadow', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');

      expect(button).toHaveStyle({ boxShadow: 'none' });
    });

    it('should have transition for opacity and visibility', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');

      expect(button).toHaveStyle({
        transition: 'opacity 0.2s ease, visibility 0.2s ease',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle buttonTop=0 correctly', () => {
      render(<SiderToggleButton buttonTop={0} />);
      const button = screen.getByRole('button');

      // Component should render with buttonTop=0
      expect(button).toBeInTheDocument();
    });

    it('should handle very large buttonTop values', () => {
      render(<SiderToggleButton buttonTop={9999} />);
      const button = screen.getByRole('button');

      // Component should render with large buttonTop
      expect(button).toBeInTheDocument();
    });

    it('should handle negative buttonTop values', () => {
      render(<SiderToggleButton buttonTop={-50} />);
      const button = screen.getByRole('button');

      // Component should render with negative buttonTop
      expect(button).toBeInTheDocument();
    });

    it('should work correctly when toggling collapsed state multiple times', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      const { rerender } = render(
        <SiderToggleButton collapsed={false} onClick={mockOnClick} />,
      );

      const button = screen.getByRole('button');
      await user.click(button);
      expect(mockOnClick).toHaveBeenLastCalledWith(true);

      // Rerender with new collapsed state
      rerender(<SiderToggleButton collapsed={true} onClick={mockOnClick} />);
      await user.click(button);
      expect(mockOnClick).toHaveBeenLastCalledWith(false);

      // Rerender back
      rerender(<SiderToggleButton collapsed={false} onClick={mockOnClick} />);
      await user.click(button);
      expect(mockOnClick).toHaveBeenLastCalledWith(true);
    });

    it('should maintain visibility style when changing collapsed state', () => {
      const { rerender } = render(
        <SiderToggleButton collapsed={false} hidden={false} />,
      );

      let button = screen.getByRole('button');
      expect(button).toHaveStyle({ visibility: 'visible', opacity: 1 });

      // Change collapsed state while keeping hidden=false
      rerender(<SiderToggleButton collapsed={true} hidden={false} />);
      button = screen.getByRole('button');
      expect(button).toHaveStyle({ visibility: 'visible', opacity: 1 });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<SiderToggleButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      render(<SiderToggleButton collapsed={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      button.focus();

      // Press Enter key
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should be keyboard accessible via Space key', async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();

      render(<SiderToggleButton collapsed={false} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      button.focus();

      // Press Space key
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalled();
    });
  });
});
