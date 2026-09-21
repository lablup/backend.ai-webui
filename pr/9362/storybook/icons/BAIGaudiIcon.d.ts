import { CustomIconComponentProps } from './iconShim';
interface BAIGaudiIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIGaudiIcon: React.FC<BAIGaudiIconProps>;
export default BAIGaudiIcon;
