/*
 to-astryx W2-D: `BAIButton` renders Astryx `Button` / `IconButton`, so the
 antd class assertions (`ant-btn-primary`, `ant-btn-dangerous`,
 `.ant-btn-loading-icon`) no longer describe anything. Astryx styles through
 StyleX and its generated class names are not a contract, so the loading
 assertions move to `aria-busy` — which is what Astryx sets and announces, and
 which antd never exposed at all.
*/
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

    it('should keep the antd-shaped prop surface', () => {
      render(
        <BAIButton type="primary" danger disabled>
          Danger Button
        </BAIButton>,
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAccessibleName('Danger Button');
    });

    it('should render with custom className', () => {
      render(<BAIButton className="custom-class">Button</BAIButton>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  // FR-3524 — a text link action resolves to the theme's `variant:link` custom
  // variant, which `themeProps` reflects as `data-variant`/the `link` class.
  describe('Link variant', () => {
    it.each([{ type: 'link' } as const, { variant: 'link' } as const])(
      'resolves %o to the link variant',
      (props) => {
        render(<BAIButton {...props}>Edit</BAIButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('data-variant', 'link');
        expect(button).toHaveClass('link');
        // The variant carries the paint now — the class must not double up.
        expect(button).not.toHaveClass('bai-action-accent');
      },
    );

    it('keeps a caller className alongside the variant', () => {
      render(
        <BAIButton type="link" className="custom-class">
          Edit
        </BAIButton>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveAttribute('data-variant', 'link');
    });

    it.each([
      { type: 'text' } as const,
      { type: 'link', color: 'default' } as const,
      { variant: 'link', color: 'default' } as const,
    ])('leaves %o on ghost', (props) => {
      render(<BAIButton {...props}>Action</BAIButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).not.toHaveClass('bai-action-accent');
    });

    it.each([
      { type: 'link', danger: true } as const,
      { variant: 'link', color: 'danger' } as const,
    ])('leaves %o destructive', (props) => {
      render(<BAIButton {...props}>Action</BAIButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'destructive');
      expect(button).not.toHaveClass('bai-action-accent');
    });

    // The inline footprint would collapse a square hit target to its glyph, so
    // icon-only link buttons stay on ghost + the accent class.
    it('keeps an icon-only link button on ghost + the accent class', () => {
      render(<BAIButton type="link" icon={<span>i</span>} title="Info" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveClass('bai-action-accent');
    });
  });

  describe('onClick Handler', () => {
    it('should call onClick handler when clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<BAIButton onClick={onClick}>Click</BAIButton>);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick if disabled', async () => {
      const onClick = vi.fn();
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
      const action = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<BAIButton action={action}>Execute Action</BAIButton>);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(action).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during async action', async () => {
      const action = vi
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
        expect(button).toHaveAttribute('aria-busy', 'true');
      });
    });

    it('should clear loading state after action completes', async () => {
      const action = vi.fn().mockResolvedValue(undefined);
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
          expect(button).not.toHaveAttribute('aria-busy');
        },
        { timeout: 3000 },
      );
    });

    it('should call both action and onClick when both are provided', async () => {
      const action = vi.fn().mockResolvedValue(undefined);
      const onClick = vi.fn();
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
      const action = vi.fn().mockResolvedValue('success');
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
          expect(button).not.toHaveAttribute('aria-busy');
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Loading Prop Override', () => {
    it('should show loading when loading prop is true', () => {
      render(<BAIButton loading>Loading Button</BAIButton>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('should combine loading prop with action loading state', async () => {
      const action = vi
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
      expect(button).not.toHaveAttribute('aria-busy');

      // Click to start action
      await user.click(button);

      // Should show loading during action
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'true');
      });

      // Rerender with loading=true while action is still running
      rerender(
        <BAIButton action={action} loading={true}>
          Button
        </BAIButton>,
      );

      // Should still be loading
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should respect loading prop even without action', () => {
      const { rerender } = render(
        <BAIButton loading={false}>Button</BAIButton>,
      );
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');

      rerender(<BAIButton loading={true}>Button</BAIButton>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Event Object Handling', () => {
    it('should pass click event to onClick handler', async () => {
      const onClick = vi.fn();
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
      const action = vi.fn().mockResolvedValue(undefined);
      const onClick = vi.fn();
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
      const onClick = vi.fn();
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
      const action = vi
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
      const onClick = vi.fn();
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
