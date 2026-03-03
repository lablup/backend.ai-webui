import BAIButton from './BAIButton';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('BAIButton', () => {
  describe('Basic Rendering', () => {
    it('should render button with children', () => {
      render(<BAIButton>Click Me</BAIButton>);
      expect(
        screen.getByRole('button', { name: 'Click Me' }),
      ).toBeInTheDocument();
    });

    it('should pass through Ant Design Button props', () => {
      render(
        <BAIButton type="primary" danger disabled>
          Danger Button
        </BAIButton>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ant-btn-primary');
      expect(button).toHaveClass('ant-btn-dangerous');
      expect(button).toBeDisabled();
    });

    it('should render with custom className', () => {
      render(<BAIButton className="custom-class">Button</BAIButton>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('onClick Handler', () => {
    it('should call onClick handler when clicked', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<BAIButton onClick={onClick}>Click</BAIButton>);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick if disabled', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(
        <BAIButton onClick={onClick} disabled>
          Click
        </BAIButton>,
      );

      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Async Action Handling', () => {
    it('should execute async action when provided', async () => {
      const action = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<BAIButton action={action}>Execute Action</BAIButton>);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during async action', async () => {
      const action = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      const user = userEvent.setup();
      render(<BAIButton action={action}>Async Button</BAIButton>);

      const button = screen.getByRole('button');
      await user.click(button);

      // Button should show loading state immediately after click
      await waitFor(() => {
        expect(
          button.querySelector('.ant-btn-loading-icon'),
        ).toBeInTheDocument();
      });
    });

    it('should clear loading state after action completes', async () => {
      const action = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<BAIButton action={action}>Complete Action</BAIButton>);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(action).toHaveBeenCalled();
      });

      // Wait for transition to complete
      await waitFor(
        () => {
          expect(
            button.querySelector('.ant-btn-loading-icon'),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should call both action and onClick when both are provided', async () => {
      const action = jest.fn().mockResolvedValue(undefined);
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(
        <BAIButton action={action} onClick={onClick}>
          Both Handlers
        </BAIButton>,
      );

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle async action with successful resolution', async () => {
      const action = jest.fn().mockResolvedValue('success');
      const user = userEvent.setup();
      render(<BAIButton action={action}>Async Success</BAIButton>);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
      });

      // Loading state should clear after success
      await waitFor(
        () => {
          expect(
            button.querySelector('.ant-btn-loading-icon'),
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Loading Prop Override', () => {
    it('should show loading when loading prop is true', () => {
      render(<BAIButton loading>Loading Button</BAIButton>);
      expect(
        screen.getByRole('button').querySelector('.ant-btn-loading-icon'),
      ).toBeInTheDocument();
    });

    it('should combine loading prop with action loading state', async () => {
      const action = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 50)),
        );
      const user = userEvent.setup();
      const { rerender } = render(
        <BAIButton action={action} loading={false}>
          Button
        </BAIButton>,
      );

      const button = screen.getByRole('button');

      // Initially not loading
      expect(
        button.querySelector('.ant-btn-loading-icon'),
      ).not.toBeInTheDocument();

      // Click to start action
      await user.click(button);

      // Should show loading during action
      await waitFor(() => {
        expect(
          button.querySelector('.ant-btn-loading-icon'),
        ).toBeInTheDocument();
      });

      // Rerender with loading=true while action is still running
      rerender(
        <BAIButton action={action} loading={true}>
          Button
        </BAIButton>,
      );

      // Should still be loading
      expect(button.querySelector('.ant-btn-loading-icon')).toBeInTheDocument();
    });

    it('should respect loading prop even without action', () => {
      const { rerender } = render(
        <BAIButton loading={false}>Button</BAIButton>,
      );
      expect(
        screen.getByRole('button').querySelector('.ant-btn-loading-icon'),
      ).not.toBeInTheDocument();

      rerender(<BAIButton loading={true}>Button</BAIButton>);
      expect(
        screen.getByRole('button').querySelector('.ant-btn-loading-icon'),
      ).toBeInTheDocument();
    });
  });

  describe('Event Object Handling', () => {
    it('should pass click event to onClick handler', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<BAIButton onClick={onClick}>Click</BAIButton>);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        }),
      );
    });

    it('should call onClick even when action is provided', async () => {
      const action = jest.fn().mockResolvedValue(undefined);
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(
        <BAIButton action={action} onClick={onClick}>
          Button
        </BAIButton>,
      );

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'click',
          }),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined action gracefully', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(
        <BAIButton action={undefined} onClick={onClick}>
          No Action
        </BAIButton>,
      );

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle button without any handlers', async () => {
      const user = userEvent.setup();
      render(<BAIButton>No Handlers</BAIButton>);

      // Should not throw when clicked
      await expect(
        user.click(screen.getByRole('button')),
      ).resolves.not.toThrow();
    });

    it('should handle rapid clicks during async action', async () => {
      const action = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );
      const user = userEvent.setup();
      render(<BAIButton action={action}>Rapid Click</BAIButton>);

      const button = screen.getByRole('button');

      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should handle gracefully (exact behavior depends on useTransition implementation)
      await waitFor(() => {
        expect(action).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();
      render(<BAIButton onClick={onClick}>Accessible</BAIButton>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have proper aria-label when provided', () => {
      render(<BAIButton aria-label="Custom Label">Button</BAIButton>);
      expect(
        screen.getByRole('button', { name: 'Custom Label' }),
      ).toBeInTheDocument();
    });
  });
});
