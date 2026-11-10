import { CustomIconComponentProps } from './iconShim';
interface BAIPipelineIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIPipelineIcon: React.FC<BAIPipelineIconProps>;
export default BAIPipelineIcon;
