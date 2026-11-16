import { CustomIconComponentProps } from './iconShim';
interface BAISessionsIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAISessionsIcon: React.FC<BAISessionsIconProps>;
export default BAISessionsIcon;
