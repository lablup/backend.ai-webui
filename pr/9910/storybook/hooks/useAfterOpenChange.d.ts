export interface AfterOpenChangeCallbacks {
    /** Called with the new visibility right after it changes. */
    afterOpenChange?: (open: boolean) => void;
    /** Called after the surface has closed. Drives `BAIUnmountAfterClose`. */
    afterClose?: () => void;
}
/**
 * antd fired `afterClose` when an overlay's exit transition ended. Astryx
 * surfaces have no exit transition, so the close edge of `isOpen` itself is
 * the signal: both callbacks fire from an effect on that transition, never on
 * mount or unmount. `BAIUnmountAfterClose` subscribes to exactly this.
 */
export declare function useAfterOpenChange(isOpen: boolean, { afterOpenChange, afterClose }: AfterOpenChangeCallbacks): void;
