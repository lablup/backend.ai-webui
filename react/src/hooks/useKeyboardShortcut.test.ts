import useKeyboardShortcut from './useKeyboardShortcut';
import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';

// Mock BUI's `useEventListener` (the ahooks replacement). `useKeyboardShortcut`
// imports nothing else from `backend.ai-ui`, so a factory mock is enough and
// keeps the whole component library out of this hook's test graph.
vi.mock('backend.ai-ui', () => ({
  useEventListener: vi.fn((event, handler) => {
    // Store handler for testing
    (global as any).__eventListeners = (global as any).__eventListeners || {};
    (global as any).__eventListeners[event] = handler;
  }),
}));

describe('useKeyboardShortcut', () => {
  let mockHandler: Mock;

  beforeEach(() => {
    mockHandler = vi.fn();
    // Clear stored event listeners
    (global as any).__eventListeners = {};
    // Clear DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const triggerKeydown = (options: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ...options,
    });
    const handler = (global as any).__eventListeners?.keydown;
    if (handler) {
      handler(event);
    }
    return event;
  };

  describe('Basic functionality', () => {
    it('should call handler when keyboard event is triggered', () => {
      renderHook(() => useKeyboardShortcut(mockHandler));

      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should pass the keyboard event to handler', () => {
      renderHook(() => useKeyboardShortcut(mockHandler));

      triggerKeydown({ key: 'Enter' });

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'Enter',
        }),
      );
    });
  });

  describe('Input element detection', () => {
    it('should not trigger handler when input is focused', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger handler when textarea is focused', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger handler when select is focused', () => {
      const select = document.createElement('select');
      document.body.appendChild(select);
      select.focus();

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should trigger handler when non-input element is focused', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      document.body.appendChild(div);
      div.focus();

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal detection', () => {
    // The hook detects an open modal as `dialog[open]`. It used to also accept
    // `.ant-modal`, and these fixtures built a `<div class="ant-modal">`;
    // nothing renders that class since antd was removed, and every modal in
    // the app (`BAIModal`, the app-shim's imperative dialogs) is a native
    // `<dialog>` opened with `showModal()`. Building the real element is also
    // a stronger fixture than a class-named div — it can only pass if the
    // selector matches what the app actually mounts.
    const appendOpenDialog = () => {
      const dialog = document.createElement('dialog');
      dialog.setAttribute('open', '');
      document.body.appendChild(dialog);
      return dialog;
    };

    it('should not trigger handler when modal is open', () => {
      appendOpenDialog();

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should trigger handler when a dialog is present but closed', () => {
      document.body.appendChild(document.createElement('dialog'));

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should trigger handler when no modal is open', () => {
      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('skipShortcutOnMetaKey option', () => {
    it('should not trigger handler when Ctrl key is pressed with skipShortcutOnMetaKey enabled', () => {
      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );

      triggerKeydown({ key: 'a', ctrlKey: true });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger handler when Meta key is pressed with skipShortcutOnMetaKey enabled', () => {
      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );

      triggerKeydown({ key: 'a', metaKey: true });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger handler when Alt key is pressed with skipShortcutOnMetaKey enabled', () => {
      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );

      triggerKeydown({ key: 'a', altKey: true });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger handler when Shift key is pressed with skipShortcutOnMetaKey enabled', () => {
      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );

      triggerKeydown({ key: 'a', shiftKey: true });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should trigger handler when modifier keys are pressed without skipShortcutOnMetaKey option', () => {
      renderHook(() => useKeyboardShortcut(mockHandler));

      triggerKeydown({ key: 'a', ctrlKey: true });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should trigger handler when no modifier keys are pressed with skipShortcutOnMetaKey enabled', () => {
      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );

      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Shadow DOM handling', () => {
    it('should not trigger handler when input inside shadow DOM is focused', () => {
      // Create host element with shadow root
      const host = document.createElement('div');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const input = document.createElement('input');
      shadowRoot.appendChild(input);
      document.body.appendChild(host);

      // Mock activeElement to return shadow root host
      Object.defineProperty(document, 'activeElement', {
        writable: true,
        configurable: true,
        value: host,
      });

      // Mock shadow root activeElement to return input
      Object.defineProperty(shadowRoot, 'activeElement', {
        writable: true,
        configurable: true,
        value: input,
      });

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should trigger handler when non-input element inside shadow DOM is focused', () => {
      const host = document.createElement('div');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const div = document.createElement('div');
      shadowRoot.appendChild(div);
      document.body.appendChild(host);

      // Mock activeElement to return shadow root host
      Object.defineProperty(document, 'activeElement', {
        writable: true,
        configurable: true,
        value: host,
      });

      // Mock shadow root activeElement to return div
      Object.defineProperty(shadowRoot, 'activeElement', {
        writable: true,
        configurable: true,
        value: div,
      });

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combined conditions', () => {
    it('should not trigger when both input is focused and modal is open', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const modal = document.createElement('dialog');
      modal.setAttribute('open', '');
      document.body.appendChild(modal);

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger when input is focused with skipShortcutOnMetaKey and Ctrl pressed', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );
      triggerKeydown({ key: 'a', ctrlKey: true });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should trigger handler when skipShortcutOnMetaKey is true and no modifier keys are pressed, with no input focused', () => {
      renderHook(() =>
        useKeyboardShortcut(mockHandler, { skipShortcutOnMetaKey: true }),
      );

      triggerKeydown({ key: 'Enter' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle null activeElement gracefully', () => {
      Object.defineProperty(document, 'activeElement', {
        writable: true,
        configurable: true,
        value: null,
      });

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple keyboard events', () => {
      renderHook(() => useKeyboardShortcut(mockHandler));

      triggerKeydown({ key: 'a' });
      triggerKeydown({ key: 'b' });
      triggerKeydown({ key: 'c' });

      expect(mockHandler).toHaveBeenCalledTimes(3);
    });

    it('should handle different key types', () => {
      renderHook(() => useKeyboardShortcut(mockHandler));

      triggerKeydown({ key: 'Enter' });
      expect(mockHandler).toHaveBeenCalledTimes(1);

      triggerKeydown({ key: 'Escape' });
      expect(mockHandler).toHaveBeenCalledTimes(2);

      triggerKeydown({ key: 'ArrowUp' });
      expect(mockHandler).toHaveBeenCalledTimes(3);
    });
  });
});
