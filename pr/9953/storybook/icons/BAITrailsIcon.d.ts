import { CustomIconComponentProps } from './iconShim';
interface BAITrailsIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAITrailsIcon: React.FC<BAITrailsIconProps>;
export default BAITrailsIcon;
