import { default as logo } from './ContainerCommit.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIContainerCommitIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIContainerCommitIcon: React.FC<BAIContainerCommitIconProps> = ({
  'aria-label': ariaLabel = 'container commit',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIContainerCommitIcon;
