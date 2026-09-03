import { CustomIconComponentProps } from './iconShim';
interface BAISystemMonitorIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAISystemMonitorIcon: React.FC<BAISystemMonitorIconProps>;
export default BAISystemMonitorIcon;
