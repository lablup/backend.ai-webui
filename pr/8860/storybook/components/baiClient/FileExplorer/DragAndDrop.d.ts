import { RcFile } from './hooks';
interface DragAndDropProps {
    onUpload: (files: Array<RcFile>, currentPath: string) => void;
    /** Optional container element for portal rendering */
    portalContainer?: HTMLElement | null;
    /** Dismisses the overlay once the drag is over. */
    onDragEnd?: () => void;
}
declare const DragAndDrop: React.FC<DragAndDropProps>;
export default DragAndDrop;
