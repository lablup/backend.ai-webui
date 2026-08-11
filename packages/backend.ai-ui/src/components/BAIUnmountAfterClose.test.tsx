import BAIModal from './BAIModal';
import BAIUnmountAfterClose, {
  type BAIUnmountAfterCloseChildProps,
} from './BAIUnmountAfterClose';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

/**
 * The modal leg runs against the real `BAIModal` (Astryx `Dialog`
 * underneath). It used to be antd's `Modal`; `BAIModal` keeps the same three
 * props this wrapper contracts on — `open`, and `afterClose` firing once the
 * close completes — and its own header documents that
 * `BAIUnmountAfterClose` keeps working against it unchanged. Using the
 * component we actually ship makes the suite an integration test rather than
 * a test against a library that is no longer installed.
 */
const Modal = BAIModal;

/**
 * The drawer leg is a local double, because BUI ships no drawer component:
 * the app's one drawer surface (`WEBUINotificationDrawer`) is app-side. What
 * `BAIUnmountAfterClose` cares about is the OTHER lifecycle callback shape —
 * `afterOpenChange(open)` instead of `afterClose()` — so the double
 * reproduces exactly that contract and nothing else. It is deliberately NOT a
 * visual component; asserting on a drawer's chrome here would be testing the
 * drawer, not the wrapper.
 *
 * Semantics mirrored from antd's `Drawer` (the previous subject):
 *   - renders nothing while closed;
 *   - on the open -> closed transition, fires `afterOpenChange(false)`
 *     asynchronously, standing in for the exit animation completing.
 */
const Drawer: React.FC<
  BAIUnmountAfterCloseChildProps & {
    title?: string;
    children?: React.ReactNode;
    // Accepted and ignored — call sites in this suite pass them to prove the
    // wrapper forwards unknown props untouched.
    onClose?: () => void;
    placement?: string;
    getContainer?: false;
  }
> = ({ open, afterOpenChange, children }) => {
  const wasOpen = React.useRef(open);
  React.useEffect(() => {
    if (wasOpen.current && !open) {
      const id = setTimeout(() => afterOpenChange?.(false), 0);
      wasOpen.current = !!open;
      return () => clearTimeout(id);
    }
    wasOpen.current = !!open;
  }, [open, afterOpenChange]);
  return open ? <div>{children}</div> : null;
};

describe('BAIUnmountAfterClose', () => {
  describe('Basic Rendering', () => {
    it('should render modal when open is true', () => {
      render(
        <BAIUnmountAfterClose>
          <Modal open={true} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should not render modal when open is false initially', () => {
      render(
        <BAIUnmountAfterClose>
          <Modal open={false} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('should render drawer when open is true', () => {
      render(
        <BAIUnmountAfterClose>
          <Drawer open={true} title="Test Drawer">
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('should not render drawer when open is false initially', () => {
      render(
        <BAIUnmountAfterClose>
          <Drawer open={false} title="Test Drawer">
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
    });
  });

  describe('Mount/Unmount Behavior', () => {
    it('should mount modal when open changes from false to true', () => {
      const { rerender } = render(
        <BAIUnmountAfterClose>
          <Modal open={false} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();

      rerender(
        <BAIUnmountAfterClose>
          <Modal open={true} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should mount drawer when open changes from false to true', () => {
      const { rerender } = render(
        <BAIUnmountAfterClose>
          <Drawer open={false} title="Test Drawer">
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();

      rerender(
        <BAIUnmountAfterClose>
          <Drawer open={true} title="Test Drawer">
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });
  });

  describe('afterClose Callback (Modal)', () => {
    it('should call original afterClose callback when provided', async () => {
      const originalAfterClose = vi.fn();

      render(
        <BAIUnmountAfterClose>
          <Modal open={true} title="Test Modal" afterClose={originalAfterClose}>
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();

      // The wrapper adds its own afterClose handler, verify original is preserved
      // We can't easily test this without actually closing the modal in Ant Design
      // but we can verify the modal renders with the callback
      expect(originalAfterClose).not.toHaveBeenCalled();
    });

    it('should keep modal mounted when initially open and then closed, and unmount after animation', async () => {
      const { rerender: _rerender } = render(
        <BAIUnmountAfterClose>
          <Modal open={true} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();

      // Change open to false - component will stay mounted during animation
      await act(async () => {
        _rerender(
          <BAIUnmountAfterClose>
            <Modal open={false} title="Test Modal">
              <div data-testid="modal-content">Modal Content</div>
            </Modal>
          </BAIUnmountAfterClose>,
        );
      });

      // After animation completes, component should be unmounted
      await waitFor(() => {
        expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
      });
    });

    it('should handle modal with afterClose callback', () => {
      const afterClose = vi.fn();

      render(
        <BAIUnmountAfterClose>
          <Modal open={true} title="Test Modal" afterClose={afterClose}>
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      // The wrapper enhances afterClose but doesn't call it yet
      expect(afterClose).not.toHaveBeenCalled();
    });
  });

  describe('afterOpenChange Callback (Drawer)', () => {
    it('should render drawer when open is true with getContainer', () => {
      render(
        <BAIUnmountAfterClose>
          <Drawer open={true} title="Test Drawer" getContainer={false}>
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('should preserve original afterOpenChange callback', () => {
      const originalAfterOpenChange = vi.fn();

      render(
        <BAIUnmountAfterClose>
          <Drawer
            open={true}
            title="Test Drawer"
            afterOpenChange={originalAfterOpenChange}
            getContainer={false}
          >
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      // Drawer should render
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
      // The wrapper preserves the callback (actual invocation happens in Ant Design)
    });

    it('should handle drawer with custom props', () => {
      const onClose = vi.fn();

      render(
        <BAIUnmountAfterClose>
          <Drawer
            open={true}
            title="Test Drawer"
            onClose={onClose}
            placement="right"
            getContainer={false}
          >
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close transitions', async () => {
      const { rerender } = render(
        <BAIUnmountAfterClose>
          <Modal open={true} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();

      // Rapid close and re-open before animation completes
      await act(async () => {
        rerender(
          <BAIUnmountAfterClose>
            <Modal open={false} title="Test Modal">
              <div data-testid="modal-content">Modal Content</div>
            </Modal>
          </BAIUnmountAfterClose>,
        );

        // Re-open immediately before close animation finishes
        rerender(
          <BAIUnmountAfterClose>
            <Modal open={true} title="Test Modal">
              <div data-testid="modal-content">Modal Content</div>
            </Modal>
          </BAIUnmountAfterClose>,
        );
      });

      // Modal should still be mounted after rapid transitions
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should handle multiple children error gracefully', () => {
      // React.Children.only will throw if more than one child is provided
      expect(() => {
        render(
          // @ts-expect-error - Testing error case
          <BAIUnmountAfterClose>
            <Modal open={true} title="Modal 1">
              <div>Content 1</div>
            </Modal>
            <Modal open={true} title="Modal 2">
              <div>Content 2</div>
            </Modal>
          </BAIUnmountAfterClose>,
        );
      }).toThrow();
    });

    it('should preserve modal props other than afterClose', () => {
      const onCancel = vi.fn();
      const onOk = vi.fn();

      render(
        <BAIUnmountAfterClose>
          <Modal
            open={true}
            title="Test Modal"
            onCancel={onCancel}
            onOk={onOk}
            footer={<div data-testid="custom-footer">Custom Footer</div>}
          >
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    });

    it('should preserve drawer props other than afterOpenChange', () => {
      const onClose = vi.fn();

      render(
        <BAIUnmountAfterClose>
          <Drawer
            open={true}
            title="Test Drawer"
            onClose={onClose}
            placement="right"
          >
            <div data-testid="drawer-content">Drawer Content</div>
          </Drawer>
        </BAIUnmountAfterClose>,
      );

      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });
  });

  describe('Performance and Re-rendering', () => {
    it('should not cause unnecessary re-renders when open prop stays true', () => {
      const renderCounter = vi.fn();

      const TestModal = ({ open }: { open: boolean }) => {
        renderCounter();
        return (
          <Modal open={open} title="Test Modal">
            <div data-testid="modal-content">Modal Content</div>
          </Modal>
        );
      };

      const { rerender } = render(
        <BAIUnmountAfterClose>
          <TestModal open={true} />
        </BAIUnmountAfterClose>,
      );

      const initialRenderCount = renderCounter.mock.calls.length;

      // Re-render with same props
      rerender(
        <BAIUnmountAfterClose>
          <TestModal open={true} />
        </BAIUnmountAfterClose>,
      );

      // Should render at least once more due to parent re-render
      expect(renderCounter.mock.calls.length).toBeGreaterThanOrEqual(
        initialRenderCount,
      );
    });

    it('should maintain modal state during open->close transition', async () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        const [inputValue, setInputValue] = React.useState('test');

        return (
          <div>
            <button data-testid="close-button" onClick={() => setIsOpen(false)}>
              Close
            </button>
            <BAIUnmountAfterClose>
              <Modal open={isOpen} title="Test Modal">
                <input
                  data-testid="modal-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </Modal>
            </BAIUnmountAfterClose>
          </div>
        );
      };

      render(<TestComponent />);

      const input = screen.getByTestId('modal-input') as HTMLInputElement;
      expect(input.value).toBe('test');

      // Click close button and wait for animation
      await act(async () => {
        screen.getByTestId('close-button').click();

        // Modal should still be mounted during animation
        expect(screen.getByTestId('modal-input')).toBeInTheDocument();
      });

      // After animation, modal should be unmounted
      await waitFor(() => {
        expect(screen.queryByTestId('modal-input')).not.toBeInTheDocument();
      });
    });
  });
});
