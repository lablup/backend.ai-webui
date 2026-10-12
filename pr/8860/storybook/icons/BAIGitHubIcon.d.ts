import { CustomIconComponentProps } from './iconShim';
interface BAIGitHubIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIGitHubIcon: React.FC<BAIGitHubIconProps>;
export default BAIGitHubIcon;
