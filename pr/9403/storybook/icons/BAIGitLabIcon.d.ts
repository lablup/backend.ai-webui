import { CustomIconComponentProps } from './iconShim';
interface BAIGitLabIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIGitLabIcon: React.FC<BAIGitLabIconProps>;
export default BAIGitLabIcon;
