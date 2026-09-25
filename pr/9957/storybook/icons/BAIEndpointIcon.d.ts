import { CustomIconComponentProps } from './iconShim';
interface BAIEndpointIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIEndpointIcon: React.FC<BAIEndpointIconProps>;
export default BAIEndpointIcon;
