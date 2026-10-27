import { CustomIconComponentProps } from './iconShim';
interface BAIRebelIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIRebelIcon: React.FC<BAIRebelIconProps>;
export default BAIRebelIcon;
