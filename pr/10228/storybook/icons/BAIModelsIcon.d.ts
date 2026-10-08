import { CustomIconComponentProps } from './iconShim';
interface BAIModelsIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIModelsIcon: React.FC<BAIModelsIconProps>;
export default BAIModelsIcon;
