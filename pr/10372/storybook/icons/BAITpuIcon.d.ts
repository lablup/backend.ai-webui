import { CustomIconComponentProps } from './iconShim';
interface BAITpuIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAITpuIcon: React.FC<BAITpuIconProps>;
export default BAITpuIcon;
