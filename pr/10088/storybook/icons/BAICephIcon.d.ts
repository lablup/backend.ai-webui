import { CustomIconComponentProps } from './iconShim';
interface BAICephIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAICephIcon: React.FC<BAICephIconProps>;
export default BAICephIcon;
