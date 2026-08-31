import { DialogProps } from '@astryxdesign/core/Dialog';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDialogProps extends Omit<DialogProps, 'ref' | 'isInline' | 'width' | 'aria-modal'> {
    /** Ref to the element carrying `role="dialog"` — a `div`, not a `<dialog>`. */
    ref?: React.Ref<HTMLDivElement>;
    /**
     * Width of the outer sizing box, so a percentage resolves against the
     * viewport. Astryx's own 90vw cap still applies to the surface inside it;
     * `variant="fullscreen"` ignores this.
     */
    width?: number | string;
    /**
     * Raises the portal root within the modal band, as a request the level stack
     * resolves (`resolveDialogZIndex`): a dialog opened later is still placed
     * above this one, and a value outside the band is ignored. Pass a
     * `BAI_Z_INDEX` layer, not a literal. `style` reaches the inner Dialog
     * surface, so `style={{ zIndex }}` does not.
     */
    zIndex?: number;
}
declare const BAIDialog: React.FC<BAIDialogProps>;
export default BAIDialog;
