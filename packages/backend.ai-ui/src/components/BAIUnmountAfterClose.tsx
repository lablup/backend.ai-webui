import React, { useState, useEffect } from 'react';

/**
 * The slice of the child's props this wrapper reads and writes. It used to be
 * `ModalProps | DrawerProps` imported from antd; the wrapper never needed the
 * other ~40 keys, and typing it structurally is what lets an Astryx-backed
 * `BAIModal` and a still-antd `Drawer` both flow through unchanged
 * (to-astryx phase 3 / ticket B).
 */
export interface BAIUnmountAfterCloseChildProps {
  /** Visibility flag — both antd `Modal`/`Drawer` and `BAIModal` use `open`. */
  open?: boolean;
  /** Fired once the modal has finished closing. */
  afterClose?: () => void;
  /** Drawer's equivalent, fired with the new visibility. */
  afterOpenChange?: (open: boolean) => void;
}

interface BAIUnmountModalAfterCloseProps {
  children: React.ReactElement<BAIUnmountAfterCloseChildProps>;
}

/**
 * Unmounts its single modal or drawer child once the child reports the close
 * (`afterClose` / `afterOpenChange(false)`), keeping the callbacks the call site passed.
 * ui-common Modal has no exit animation, so a modal unmounts right after it closes;
 * a child with one (a drawer) stays mounted until it ends.
 *
 * @param {BAIUnmountModalAfterCloseProps} props - The props containing a single child element.
 * @returns {React.ReactElement | null} The cloned child element with enhanced unmounting logic, or null if unmounted.
 *
 * @example
 * <UnmountAfterClose>
 *   <BAIModal open={isOpen} afterClose={handleAfterClose} />
 * </UnmountAfterClose>
 */
const BAIUnmountAfterClose: React.FC<BAIUnmountModalAfterCloseProps> = ({
  children,
}) => {
  // Ensure there is only one child element
  const childElement = React.Children.only(children);
  const isOpen = childElement.props.open;

  // Initialized from `isOpen` so a child that mounts open is not unmounted
  // before its effect runs.
  const [afterClosed, setAfterClosed] = useState(() => !isOpen);

  // Reset the afterClosed state to false whenever the modal is opened, so it can be unmounted after the next close.
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAfterClosed(false);
    }
  }, [isOpen]);

  // Derived synchronously so the child mounts on the same render `open` turns true.
  const isMount = isOpen || !afterClosed;

  // Return null if the modal should not be rendered
  if (!isMount) {
    return null;
  }

  // Preserve the original afterClose callback if it exists
  const originalAfterClose = childElement.props.afterClose;

  // New handler to intercept afterClose
  const handleModalAfterClose = () => {
    if (originalAfterClose) {
      originalAfterClose();
    }
    setAfterClosed(true);
  };

  // Preserve the original afterOpenChange callback if it exists
  const originalAfterOpenChange = childElement.props.afterOpenChange;

  // New handler to intercept afterOpenChange
  const handleModalAfterOpenChange = (open: boolean) => {
    if (originalAfterOpenChange) {
      originalAfterOpenChange(open);
    }
    if (!open) {
      setAfterClosed(true);
    }
  };

  // Clone the child element with proper typing
  const clonedChild = React.cloneElement(childElement, {
    // for Modal
    afterClose: handleModalAfterClose,
    // for Drawer
    afterOpenChange: handleModalAfterOpenChange,
  });

  return clonedChild;
};

export default BAIUnmountAfterClose;
