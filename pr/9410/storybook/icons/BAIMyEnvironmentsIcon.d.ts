import { CustomIconComponentProps } from './iconShim';
interface BAIMyEnvironmentsIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIMyEnvironmentsIcon: React.FC<BAIMyEnvironmentsIconProps>;
export default BAIMyEnvironmentsIcon;
