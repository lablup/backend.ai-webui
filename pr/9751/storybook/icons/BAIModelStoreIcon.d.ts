import { CustomIconComponentProps } from './iconShim';
interface BAIModelStoreIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIModelStoreIcon: React.FC<BAIModelStoreIconProps>;
export default BAIModelStoreIcon;
