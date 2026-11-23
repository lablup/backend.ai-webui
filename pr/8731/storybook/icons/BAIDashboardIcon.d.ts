import { CustomIconComponentProps } from './iconShim';
interface BAIDashboardIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIDashboardIcon: React.FC<BAIDashboardIconProps>;
export default BAIDashboardIcon;
