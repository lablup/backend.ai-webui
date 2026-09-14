import { CustomIconComponentProps } from './iconShim';
interface BAIUserUnionIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIUserUnionIcon: React.FC<BAIUserUnionIconProps>;
export default BAIUserUnionIcon;
