import { BAIDirectoryPickerModalQuery } from '../../../__generated__/BAIDirectoryPickerModalQuery.graphql';
import { BAIModalProps } from '../../BAIModal';
import { PreloadedQuery } from 'react-relay';
export declare const BAIDirectoryPickerQuery: import('relay-runtime').GraphQLTaggedNode;
export interface BAIDirectoryPickerModalProps extends Omit<BAIModalProps, 'onOk' | 'onCancel' | 'footer' | 'title'> {
    vfolderUuid: string;
    /**
     * Preloaded reference to `BAIDirectoryPickerQuery` produced by the opener
     * via `useQueryLoader`, keyed by this vfolder's global id.
     */
    queryRef: PreloadedQuery<BAIDirectoryPickerModalQuery>;
    /** Sub path to start browsing from ('' = vfolder root). */
    defaultPath?: string;
    /** Called with the chosen sub path, or `undefined` when cancelled. */
    onRequestClose: (selectedSubPath?: string) => void;
}
/**
 * A directory-only picker built on `BAIFileExplorer`'s `directoryPicker`
 * mode: browse the vfolder (files visible but disabled, folder CRUD
 * available) and confirm the current location with the footer button.
 *
 * Suspends until the preloaded `vfolder_node` query (and the BAIClient
 * promise consumed inside `BAIFileExplorer`) resolves, so it mounts fully
 * ready — folder name in the title, permissions applied. Openers must
 * therefore mount it inside a transition (`loadQuery` + open-state update
 * wrapped in `startTransition`, as `BAIVFolderPathPicker` does, surfacing
 * `isPending` on the trigger) or provide their own Suspense boundary.
 */
declare const BAIDirectoryPickerModal: React.FC<BAIDirectoryPickerModalProps>;
export default BAIDirectoryPickerModal;
