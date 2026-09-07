import { CustomIconComponentProps } from './iconShim';
interface BAIFuriosaIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIFuriosaIcon: React.FC<BAIFuriosaIconProps>;
export default BAIFuriosaIcon;
