import { CustomIconComponentProps } from './iconShim';
interface BAIListIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIListIcon: React.FC<BAIListIconProps>;
export default BAIListIcon;
