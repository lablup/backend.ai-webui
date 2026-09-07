import { CustomIconComponentProps } from './iconShim';
interface BAIRocmIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIRocmIcon: React.FC<BAIRocmIconProps>;
export default BAIRocmIcon;
