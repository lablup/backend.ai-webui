import { CustomIconComponentProps } from './iconShim';
interface BAIPureStorageIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIPureStorageIcon: React.FC<BAIPureStorageIconProps>;
export default BAIPureStorageIcon;
