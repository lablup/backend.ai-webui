import useKeyboardShortcut from './useKeyboardShortcut';
import { renderHook } from '@testing-library/react';

// Mock ahooks useEventListener
jest.mock('ahooks', () => ({
  useEventListener: jest.fn((event, handler) => {
    // Store handler for testing
    (global as any).__eventListeners = (global as any).__eventListeners || {};
    (global as any).__eventListeners[event] = handler;
  }),
}));

describe('useKeyboardShortcut', () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn();
    // Clear stored event listeners
    (global as any).__eventListeners = {};
    // Clear DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    it('should not trigger handler when modal is open', () => {
      const modal = document.createElement('div');
      modal.className = 'ant-modal';
      document.body.appendChild(modal);

      renderHook(() => useKeyboardShortcut(mockHandler));
      triggerKeydown({ key: 'a' });

      expect(mockHandler).not.toHaveBeenCalled();
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

      const modal = document.createElement('div');
      modal.className = 'ant-modal';
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
