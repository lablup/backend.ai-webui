import { CustomIconComponentProps } from './iconShim';
interface BAIRestoreIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIRestoreIcon: React.FC<BAIRestoreIconProps>;
export default BAIRestoreIcon;
