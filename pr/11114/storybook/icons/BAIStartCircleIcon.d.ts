import { CustomIconComponentProps } from './iconShim';
interface BAIStartCircleIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIStartCircleIcon: React.FC<BAIStartCircleIconProps>;
export default BAIStartCircleIcon;
