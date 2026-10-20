import { CustomIconComponentProps } from './iconShim';
interface BAIPurgeIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIPurgeIcon: React.FC<BAIPurgeIconProps>;
export default BAIPurgeIcon;
