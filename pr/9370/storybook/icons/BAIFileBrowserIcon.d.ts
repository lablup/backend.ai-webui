import { CustomIconComponentProps } from './iconShim';
interface BAIFileBrowserIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIFileBrowserIcon: React.FC<BAIFileBrowserIconProps>;
export default BAIFileBrowserIcon;
