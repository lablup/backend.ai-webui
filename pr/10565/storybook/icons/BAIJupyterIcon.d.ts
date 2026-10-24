import { CustomIconComponentProps } from './iconShim';
interface BAIJupyterIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIJupyterIcon: React.FC<BAIJupyterIconProps>;
export default BAIJupyterIcon;
