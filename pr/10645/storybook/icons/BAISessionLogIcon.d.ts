import { CustomIconComponentProps } from './iconShim';
interface BAISessionLogIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAISessionLogIcon: React.FC<BAISessionLogIconProps>;
export default BAISessionLogIcon;
