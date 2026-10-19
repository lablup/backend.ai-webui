import { CustomIconComponentProps } from './iconShim';
interface BAIURLStartIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIURLStartIcon: React.FC<BAIURLStartIconProps>;
export default BAIURLStartIcon;
