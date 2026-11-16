import { CustomIconComponentProps } from './iconShim';
interface BAISftpIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAISftpIcon: React.FC<BAISftpIconProps>;
export default BAISftpIcon;
