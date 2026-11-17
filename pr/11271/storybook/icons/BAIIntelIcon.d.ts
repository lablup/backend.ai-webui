import { CustomIconComponentProps } from './iconShim';
interface BAIIntelIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIIntelIcon: React.FC<BAIIntelIconProps>;
export default BAIIntelIcon;
