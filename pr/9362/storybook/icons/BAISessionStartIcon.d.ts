import { CustomIconComponentProps } from './iconShim';
interface BAISessionStartIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAISessionStartIcon: React.FC<BAISessionStartIconProps>;
export default BAISessionStartIcon;
