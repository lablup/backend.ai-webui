import { CustomIconComponentProps } from './iconShim';
interface BAIModelServiceIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIModelServiceIcon: React.FC<BAIModelServiceIconProps>;
export default BAIModelServiceIcon;
