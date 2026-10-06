import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIVFolderIdenticonProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
    /**
     * Seed of the identicon. The host's Relay identicons seed on the node's
     * global id, so pass that to draw the same glyph as the folder lists.
     */
    seed?: string;
    /** Dashed vfolder UUID; seeds as the `VirtualFolderNode` global id. */
    vfolderId?: string;
}
/**
 * The folder glyph drawn next to a folder name. Decorative: the name beside
 * it is the accessible text, so `alt` is empty.
 */
declare const BAIVFolderIdenticon: React.FC<BAIVFolderIdenticonProps>;
export default BAIVFolderIdenticon;
