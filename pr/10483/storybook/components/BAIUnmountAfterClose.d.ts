import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
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
 * @param {BAIUnmountModalAfterCloseProps} props - The props containing a single child element.
 * @returns {React.ReactElement | null} The cloned child element with enhanced unmounting logic, or null if unmounted.
 *
 * @example
 * <UnmountAfterClose>
 *   <BAIModal open={isOpen} afterClose={handleAfterClose} />
 * </UnmountAfterClose>
 */
declare const BAIUnmountAfterClose: React.FC<BAIUnmountModalAfterCloseProps>;
export default BAIUnmountAfterClose;
