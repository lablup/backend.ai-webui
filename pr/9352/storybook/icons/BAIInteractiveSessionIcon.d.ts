import { CustomIconComponentProps } from './iconShim';
interface BAIInteractiveSessionIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIInteractiveSessionIcon: React.FC<BAIInteractiveSessionIconProps>;
export default BAIInteractiveSessionIcon;
