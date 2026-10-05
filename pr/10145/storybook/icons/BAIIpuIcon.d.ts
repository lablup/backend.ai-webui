import { CustomIconComponentProps } from './iconShim';
interface BAIIpuIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIIpuIcon: React.FC<BAIIpuIconProps>;
export default BAIIpuIcon;
