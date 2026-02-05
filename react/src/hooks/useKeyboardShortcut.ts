import { useEventListener } from 'ahooks';
import { createStyles } from 'antd-style';

export const useKeyboardShortcutTextStyles = createStyles(() => ({
  shortcutText: {
    code: {
      margin: 0,
      border: '1px solid rgba(255, 255, 255, 0.6)',
      borderRadius: 4,
    },
  },
}));

/**
 * useKeyboardShortcut
 * A custom hook to handle keyboard shortcuts when no input or textarea is focused,
 * including within Shadow DOM.
 *
 * @param handler - The callback to invoke when the shortcut is triggered.
 */
const useKeyboardShortcut = (
  handler: (event: KeyboardEvent) => void,
  options?: {
    skipShortcutOnMetaKey?: boolean;
  },
) => {
  /**
   * Checks if an element is a focusable input field (input, textarea, or select).
   * @param element - The element to check.
   */
  const isInputElement = (element: Element | null): boolean => {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    return (
      tagName === 'input' || tagName === 'textarea' || tagName === 'select'
    );
  };

  /**
   * Recursively checks if the active element or its Shadow DOM ancestors are input fields.
   * @param element - The starting element.
   */
  const isShadowInput = (element: Element | null): boolean => {
    let currentElement: Element | null = element;
    while (currentElement) {
      if (isInputElement(currentElement)) return true;
      if (currentElement instanceof HTMLElement && currentElement.shadowRoot) {
        currentElement = currentElement.shadowRoot.activeElement;
      } else {
        break;
      }
    }
    return false;
  };

  const isModalOpen = () => document.querySelector('.ant-modal');

  /**
   * Handles the keydown event, invoking the handler if conditions are met.
   * @param event - The keyboard event.
   */
  const handleKeyDown = (event: KeyboardEvent): void => {
    const activeElement = document.activeElement;

    if (
      options?.skipShortcutOnMetaKey &&
      (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
    ) {
      return;
    }
    if (
      activeElement &&
      (isInputElement(activeElement) ||
        isShadowInput(activeElement) ||
        isModalOpen())
    ) {
      // If the active element is a focusable input, do not trigger the shortcut
      return;
    }

    handler(event);
  };

  // Use ahooks' useEventListener for global keyboard event management
  useEventListener('keydown', handleKeyDown);
};

export default useKeyboardShortcut;
