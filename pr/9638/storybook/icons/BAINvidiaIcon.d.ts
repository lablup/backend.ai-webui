import { CustomIconComponentProps } from './iconShim';
interface BAINvidiaIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
    size?: number;
}
declare const BAINvidiaIcon: React.FC<BAINvidiaIconProps>;
export default BAINvidiaIcon;
