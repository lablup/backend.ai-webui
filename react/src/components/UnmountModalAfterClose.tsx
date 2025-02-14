import { BAIModalProps } from './BAIModal';
import { ModalProps } from 'antd';
import React, { useState, useLayoutEffect } from 'react';

interface UnmountModalAfterCloseProps {
  children: React.ReactElement<BAIModalProps> | React.ReactElement<ModalProps>;
}

const UnmountModalAfterClose: React.FC<UnmountModalAfterCloseProps> = ({
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

  // Clone the child element, keeping the open prop and replacing afterClose with the new handler
  const clonedChild = React.cloneElement(modalElement, {
    afterClose: handleModalAfterClose,
  });

  return clonedChild;
};

export default UnmountModalAfterClose;
