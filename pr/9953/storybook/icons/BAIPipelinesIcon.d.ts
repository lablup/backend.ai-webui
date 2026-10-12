import { CustomIconComponentProps } from './iconShim';
interface BAIPipelinesIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIPipelinesIcon: React.FC<BAIPipelinesIconProps>;
export default BAIPipelinesIcon;
