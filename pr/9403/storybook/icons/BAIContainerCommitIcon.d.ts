import { CustomIconComponentProps } from './iconShim';
interface BAIContainerCommitIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAIContainerCommitIcon: React.FC<BAIContainerCommitIconProps>;
export default BAIContainerCommitIcon;
