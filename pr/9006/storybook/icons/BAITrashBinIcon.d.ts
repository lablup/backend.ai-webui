import { CustomIconComponentProps } from './iconShim';
interface BAITrashBinIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAITrashBinIcon: React.FC<BAITrashBinIconProps>;
export default BAITrashBinIcon;
