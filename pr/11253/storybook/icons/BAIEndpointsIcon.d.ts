import { CustomIconComponentProps } from './iconShim';
interface BAIEndpointsIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIEndpointsIcon: React.FC<BAIEndpointsIconProps>;
export default BAIEndpointsIcon;
