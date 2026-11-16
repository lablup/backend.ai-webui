import { CustomIconComponentProps } from './iconShim';
interface BAIAppIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIAppIcon: React.FC<BAIAppIconProps>;
export default BAIAppIcon;
