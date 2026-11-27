import React, { useState, useEffect } from 'react';

export interface BAIUnmountAfterCloseChildProps {
  open?: boolean;
  isOpen?: boolean;
  afterClose?: () => void;
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
 * @example
 * <BAIUnmountAfterClose>
 *   <BAIModal open={isOpen} afterClose={handleAfterClose} />
 * </BAIUnmountAfterClose>
 */
const BAIUnmountAfterClose: React.FC<BAIUnmountModalAfterCloseProps> = ({
  children,
}) => {
  const childElement = React.Children.only(children);
  const isOpen = childElement.props.open ?? childElement.props.isOpen;

  // Initialized from `isOpen` so a child that mounts open is not unmounted
  // before its effect runs.
  const [afterClosed, setAfterClosed] = useState(() => !isOpen);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAfterClosed(false);
    }
  }, [isOpen]);

  // Derived synchronously so the child mounts on the same render `open` turns true.
  const isMount = isOpen || !afterClosed;

  if (!isMount) {
    return null;
  }

  const originalAfterClose = childElement.props.afterClose;

  const handleModalAfterClose = () => {
    if (originalAfterClose) {
      originalAfterClose();
    }
    setAfterClosed(true);
  };

  const originalAfterOpenChange = childElement.props.afterOpenChange;

  const handleModalAfterOpenChange = (open: boolean) => {
    if (originalAfterOpenChange) {
      originalAfterOpenChange(open);
    }
    if (!open) {
      setAfterClosed(true);
    }
  };

  const clonedChild = React.cloneElement(childElement, {
    afterClose: handleModalAfterClose,
    afterOpenChange: handleModalAfterOpenChange,
  });

  return clonedChild;
};

export default BAIUnmountAfterClose;
