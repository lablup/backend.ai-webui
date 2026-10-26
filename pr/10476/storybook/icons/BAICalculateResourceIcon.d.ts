import { CustomIconComponentProps } from './iconShim';
interface BAICalculateResourceIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAICalculateResourceIcon: React.FC<BAICalculateResourceIconProps>;
export default BAICalculateResourceIcon;
