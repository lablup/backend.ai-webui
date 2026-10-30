import { CustomIconComponentProps } from './iconShim';
interface BAIExamplesIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIExamplesIcon: React.FC<BAIExamplesIconProps>;
export default BAIExamplesIcon;
