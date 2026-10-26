import { CustomIconComponentProps } from './iconShim';
interface BAIShareAltIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIShareAltIcon: React.FC<BAIShareAltIconProps>;
export default BAIShareAltIcon;
