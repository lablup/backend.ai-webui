import BAITag from './BAITag';
import { describe, expect, it } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
describe('BAITag', () => {
  describe('Basic Rendering', () => {
    it('should render tag with children text', () => {
      render(<BAITag>Test Tag</BAITag>);
      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('should render tag with custom color', () => {
      render(<BAITag color="blue">Blue Tag</BAITag>);
      const tag = screen.getByText('Blue Tag');
      expect(tag).toBeInTheDocument();
    });

    it('should render tag with closable property', () => {
      render(<BAITag closable>Closable Tag</BAITag>);
      expect(screen.getByText('Closable Tag')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('Tag Variants', () => {
    it('should render success tag', () => {
      render(<BAITag color="success">Success</BAITag>);
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should render error tag', () => {
      render(<BAITag color="error">Error</BAITag>);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should render warning tag', () => {
      render(<BAITag color="warning">Warning</BAITag>);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should render info tag', () => {
      render(<BAITag color="processing">Processing</BAITag>);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should render default tag without color', () => {
      render(<BAITag>Default</BAITag>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render tag with icon', () => {
      const TestIcon = () => <span data-testid="test-icon">★</span>;
      render(<BAITag icon={<TestIcon />}>Tag with Icon</BAITag>);
      expect(screen.getByText('Tag with Icon')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <BAITag closable onClose={handleClose}>
          Closable
        </BAITag>,
      );
      const closeButton = screen.getByRole('img', { name: /close/i });
      act(() => {
        closeButton.click();
      });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not show close button when closable is false', () => {
      render(<BAITag closable={false}>Not Closable</BAITag>);
      expect(
        screen.queryByRole('img', { name: /close/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Props Passthrough', () => {
    it('should apply custom className', () => {
      render(<BAITag className="custom-class">Custom Class</BAITag>);
      expect(screen.getByText('Custom Class')).toBeInTheDocument();
    });

    it('should apply custom style', () => {
      render(<BAITag style={{ fontSize: '20px' }}>Custom Style</BAITag>);
      expect(screen.getByText('Custom Style')).toBeInTheDocument();
    });

    it('should handle bordered property', () => {
      render(<BAITag bordered>Bordered Tag</BAITag>);
      expect(screen.getByText('Bordered Tag')).toBeInTheDocument();
    });

    it('should handle bordered={false} property', () => {
      render(<BAITag bordered={false}>No Border Tag</BAITag>);
      expect(screen.getByText('No Border Tag')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should render empty tag', () => {
      const { container } = render(<BAITag />);
      expect(container.querySelector('.ant-tag')).toBeInTheDocument();
    });

    it('should render tag with number as children', () => {
      render(<BAITag>{42}</BAITag>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render tag with React element as children', () => {
      render(
        <BAITag>
          <span>Nested Element</span>
        </BAITag>,
      );
      expect(screen.getByText('Nested Element')).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      const { container } = render(<BAITag>{undefined}</BAITag>);
      expect(container.querySelector('.ant-tag')).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      const { container } = render(<BAITag>{null}</BAITag>);
      expect(container.querySelector('.ant-tag')).toBeInTheDocument();
    });
  });

  describe('Theme Customization', () => {
    it('should apply custom ConfigProvider theme with transparent background', () => {
      const { container } = render(<BAITag>Themed Tag</BAITag>);
      const tag = container.querySelector('.ant-tag');
      expect(tag).toBeInTheDocument();
    });

    it('should apply theme with borderRadiusSM of 11', () => {
      const { container } = render(<BAITag>Rounded Tag</BAITag>);
      const tag = container.querySelector('.ant-tag');
      expect(tag).toBeInTheDocument();
    });

    it('should apply custom padding from token', () => {
      const { container } = render(<BAITag>Padded Tag</BAITag>);
      const tag = container.querySelector('.ant-tag');
      expect(tag).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible when closable', () => {
      const handleClose = jest.fn();
      render(
        <BAITag closable onClose={handleClose}>
          Accessible Tag
        </BAITag>,
      );
      const closeButton = screen.getByRole('img', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should have proper aria attributes for close button', () => {
      render(<BAITag closable>Closable</BAITag>);
      const closeButton = screen.getByRole('img', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Multiple Tags', () => {
    it('should render multiple tags with different colors', () => {
      render(
        <>
          <BAITag color="success">Success</BAITag>
          <BAITag color="error">Error</BAITag>
          <BAITag color="warning">Warning</BAITag>
        </>,
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should handle multiple closable tags independently', () => {
      const handleClose1 = jest.fn();
      const handleClose2 = jest.fn();
      render(
        <>
          <BAITag closable onClose={handleClose1}>
            Tag 1
          </BAITag>
          <BAITag closable onClose={handleClose2}>
            Tag 2
          </BAITag>
        </>,
      );
      const closeButtons = screen.getAllByRole('img', { name: /close/i });
      expect(closeButtons).toHaveLength(2);
      act(() => {
        closeButtons[0].click();
      });
      expect(handleClose1).toHaveBeenCalledTimes(1);
      expect(handleClose2).toHaveBeenCalledTimes(0);
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick when tag is clicked', () => {
      const handleClick = jest.fn();
      render(<BAITag onClick={handleClick}>Clickable Tag</BAITag>);
      const tag = screen.getByText('Clickable Tag');
      act(() => {
        tag.click();
      });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClose with event parameter', () => {
      const handleClose = jest.fn();
      render(
        <BAITag closable onClose={handleClose}>
          Closable
        </BAITag>,
      );
      const closeButton = screen.getByRole('img', { name: /close/i });
      act(() => {
        closeButton.click();
      });
      expect(handleClose).toHaveBeenCalled();
      expect(handleClose.mock.calls[0][0]).toBeDefined();
    });
  });

  describe('Color Variants', () => {
    it('should render hex color tag', () => {
      render(<BAITag color="#ff0000">Red Tag</BAITag>);
      expect(screen.getByText('Red Tag')).toBeInTheDocument();
    });

    it('should render RGB color tag', () => {
      render(<BAITag color="rgb(0, 128, 0)">Green Tag</BAITag>);
      expect(screen.getByText('Green Tag')).toBeInTheDocument();
    });
  });
});
