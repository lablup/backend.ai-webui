import { CustomIconComponentProps } from './iconShim';
interface BAIUserOutlinedIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIUserOutlinedIcon: React.FC<BAIUserOutlinedIconProps>;
export default BAIUserOutlinedIcon;
