import { CustomIconComponentProps } from './iconShim';
interface BAIHuggingFaceIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIHuggingFaceIcon: React.FC<BAIHuggingFaceIconProps>;
export default BAIHuggingFaceIcon;
