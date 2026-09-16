import { CustomIconComponentProps } from './iconShim';
interface BAIRescanImagesIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIRescanImagesIcon: React.FC<BAIRescanImagesIconProps>;
export default BAIRescanImagesIcon;
