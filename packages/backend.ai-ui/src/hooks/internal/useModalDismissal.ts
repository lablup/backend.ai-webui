import { useLayerDismissal } from '@lablup/ui-common/Layer';

export type ModalDismissPurpose = 'info' | 'form' | 'required';

/** antd's `maskClosable` / `keyboard` pair → ui-common `Modal` `purpose`. */
export function toModalPurpose(
  maskClosable: boolean,
  keyboard: boolean,
): ModalDismissPurpose {
  return maskClosable ? 'info' : keyboard ? 'form' : 'required';
}

/**
 * Consumes Escape for a modal whose `purpose` would otherwise close on it
 * (`info`, or `AlertModal`'s fixed `form`). Call it in the component that
 * renders the modal: the block layer then sits at the modal's depth and
 * registers after it, so it outranks the modal's own layer while layers opened
 * inside the modal (deeper) and modals opened later (registered later) still
 * get the press.
 */
export function useBlockModalEscape(isActive: boolean): void {
  'use memo';
  useLayerDismissal({
    isActive,
    escapeBehavior: 'block',
    onDismiss: () => {},
  });
}
