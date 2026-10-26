import { CustomIconComponentProps } from './iconShim';
interface BAITerminalAppIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAITerminalAppIcon: React.FC<BAITerminalAppIconProps>;
export default BAITerminalAppIcon;
