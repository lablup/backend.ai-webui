import { CustomIconComponentProps } from './iconShim';
interface BAIExampleStartIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIExampleStartIcon: React.FC<BAIExampleStartIconProps>;
export default BAIExampleStartIcon;
