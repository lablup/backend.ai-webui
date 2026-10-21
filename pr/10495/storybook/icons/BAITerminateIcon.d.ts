import { CustomIconComponentProps } from './iconShim';
interface BAITerminateIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAITerminateIcon: React.FC<BAITerminateIconProps>;
export default BAITerminateIcon;
