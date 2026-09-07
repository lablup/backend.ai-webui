import { VFolderFile } from '../../provider/BAIClientProvider/types';
/**
 * `RcFile` from `antd/es/upload`, restated locally (to-astryx W2-D).
 *
 * It is the ONE antd specifier the FileExplorer's upload path carried, across
 * four modules (`hooks.ts`, `BAIFileExplorer`, `DragAndDrop`,
 * `ExplorerActionControls`) — a type that renders nothing and is therefore
 * invisible to a screenshot (MAPPING §6 rule 1). The upstream definition is
 * two lines (`interface RcFile extends File { uid: string }` in
 * rc-component's `upload`, plus antd's `readonly lastModifiedDate: Date`), and
 * the file objects themselves come from the browser's `DataTransfer` /
 * `<input type="file">` — never from antd's `Upload`, which this component
 * tree no longer renders. Consumers keep importing the name from here.
 */
export interface RcFile extends File {
    uid: string;
    readonly lastModifiedDate: Date;
}
/**
 * Tracks whether a file is being dragged over the page, so the explorer can
 * show its upload overlay.
 *
 * Three listener phases are load-bearing here, because the overlay's Astryx
 * `FileInput` calls `stopPropagation()` on its own `dragenter`/`dragover`/
 * `dragleave`/`drop`, and it now covers the whole overlay (FR-3575):
 *
 * - `dragleave` on CAPTURE — on bubble the dropzone swallows every leave,
 *   including the one that fires when the drag exits the window, and the
 *   overlay is left up for good.
 * - `drop` on BUBBLE — a capture listener runs before React dispatches
 *   `FileInput`'s handler, and since `drop` is discrete priority the state
 *   update flushes synchronously and unmounts the dropzone, silently
 *   discarding the file. Closing on a drop that HITS the dropzone is the
 *   overlay's own job, via `close` (`DragAndDrop`'s deferred `onDropCapture`).
 * - `mousedown`/`keydown`/`wheel` while open — a cancelled drag (Escape, or a
 *   drop the OS rejects) fires no drag event at all, so the overlay needs some
 *   non-drag signal to come down. It must be one the browser CANNOT deliver
 *   mid-drag: a pointer-motion signal looks earlier but is not suppressed on
 *   every platform, and one stray `mousemove` unmounts the dropzone with the
 *   drag still in flight — the drop then has nothing to land on and the
 *   browser opens the file instead of uploading it (FR-3575).
 */
export declare const useDragOverlay: (containerRef?: React.RefObject<HTMLDivElement | null>) => {
    isDragMode: boolean;
    portalContainer: HTMLElement | null;
    close: () => void;
};
export declare const useSearchVFolderFiles: (vfolder: string, fetchKey?: string) => {
    files: NoInfer<{
        items: Array<VFolderFile>;
    }> | undefined;
    directoryTree: Record<string, VFolderFile[]>;
    currentPath: string;
    navigateDown: (folderName: string) => void;
    navigateUp: () => void;
    navigateToPath: (path: string) => void;
    refetch: (options?: import('@tanstack/react-query').RefetchOptions) => Promise<import('@tanstack/react-query').QueryObserverResult<NoInfer<{
        items: Array<VFolderFile>;
    }>, Error>>;
    isFetching: boolean;
    isLoading: boolean;
};
export declare const useUploadVFolderFiles: () => {
    uploadFiles: (fileList: Array<RcFile>, onUpload: (files: Array<RcFile>, currentPath: string) => void, afterUpload?: () => void) => Promise<void>;
};
