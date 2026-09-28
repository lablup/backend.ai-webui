import { CustomIconComponentProps } from './iconShim';
interface BAIBatchSessionIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIBatchSessionIcon: React.FC<BAIBatchSessionIconProps>;
export default BAIBatchSessionIcon;
