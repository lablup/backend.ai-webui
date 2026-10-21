import { CustomIconComponentProps } from './iconShim';
interface BAINewFolderIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAINewFolderIcon: React.FC<BAINewFolderIconProps>;
export default BAINewFolderIcon;
