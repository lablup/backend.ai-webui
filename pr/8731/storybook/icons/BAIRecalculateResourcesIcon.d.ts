import { CustomIconComponentProps } from './iconShim';
interface BAIRecalculateResourcesIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIRecalculateResourcesIcon: React.FC<BAIRecalculateResourcesIconProps>;
export default BAIRecalculateResourcesIcon;
