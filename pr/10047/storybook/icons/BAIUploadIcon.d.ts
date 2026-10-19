import { CustomIconComponentProps } from './iconShim';
interface BAIUploadIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIUploadIcon: React.FC<BAIUploadIconProps>;
export default BAIUploadIcon;
