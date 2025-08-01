import { BAIModalProps } from './BAIModal';
import { DrawerProps, ModalProps } from 'antd';
import React, { useState, useLayoutEffect } from 'react';

interface UnmountModalAfterCloseProps {
  children: React.ReactElement<BAIModalProps> | React.ReactElement<ModalProps>;
}

/**
 * A React component that conditionally unmounts its child modal or drawer component
 * after it has been closed, preserving exit animations.
 *
 * This component expects a single child element (such as a Modal or Drawer) with an `open` prop.
 * It manages an internal mount state to ensure the child remains mounted during exit animations,
 * and only unmounts after the close animation completes.
 *
 * The component intercepts the child's `afterClose` (for Modal) and `afterOpenChange` (for Drawer)
 * callbacks to update its internal state, while preserving any original callbacks provided.
 *
 * @param {UnmountModalAfterCloseProps} props - The props containing a single child element.
 * @returns {React.ReactElement | null} The cloned child element with enhanced unmounting logic, or null if unmounted.
 *
 * @example
 * <UnmountAfterClose>
 *   <Modal open={isOpen} afterClose={handleAfterClose} />
 * </UnmountAfterClose>
 */
const UnmountAfterClose: React.FC<UnmountModalAfterCloseProps> = ({
  children,
}) => {
  // Ensure there is only one child element
  const modalElement = React.Children.only(children);
  const isModalOpen = modalElement.props.open;

  // Manage internal rendering state
  const [isMount, setIsMount] = useState(isModalOpen);

  // Update internal state when the child's open prop becomes true
  useLayoutEffect(() => {
    if (isModalOpen) {
      setIsMount(true);
    }
  }, [isModalOpen]);

  // Return null if the modal should not be rendered
  if (!isMount) {
    return null;
  }

  // Preserve the original afterClose callback if it exists
  const originalAfterClose = modalElement.props.afterClose;

  // New handler to intercept afterClose
  const handleModalAfterClose: ModalProps['afterClose'] = (...args) => {
    if (originalAfterClose) {
      originalAfterClose(...args);
    }
    // Set internal state to false after the exit animation completes
    setIsMount(false);
  };

  // Preserve the original afterOpenChange callback if it exists
  const originalAfterOpenChange = modalElement.props.afterOpenChange;
  // New handler to intercept afterOpenChange
  const handleModalAfterOpenChange: DrawerProps['afterOpenChange'] = (open) => {
    if (originalAfterOpenChange) {
      originalAfterOpenChange(open);
    }
    // Set internal state to false after the exit animation completes
    if (!open) {
      setIsMount(false);
    }
  };

  // Clone the child element, keeping the open prop and replacing afterClose with the new handler
  const clonedChild = React.cloneElement(modalElement, {
    // for Modal
    afterClose: handleModalAfterClose,
    // for Drawer
    afterOpenChange: handleModalAfterOpenChange,
  });

  return clonedChild;
};

export default UnmountAfterClose;
