import { RcFile } from './hooks';
interface DragAndDropProps {
    /** Hands the drop to the explorer's duplicate-aware upload path. */
    onUpload: (files: Array<RcFile>) => void;
    /** Optional container element for portal rendering */
    portalContainer?: HTMLElement | null;
    /** Dismisses the overlay once the drag is over. */
    onDragEnd?: () => void;
}
declare const DragAndDrop: React.FC<DragAndDropProps>;
export default DragAndDrop;
