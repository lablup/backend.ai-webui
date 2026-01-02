import { default as logo } from './ContainerCommit.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIContainerCommitIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIContainerCommitIcon: React.FC<BAIContainerCommitIconProps> = ({
  'aria-label': ariaLabel = 'container commit',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIContainerCommitIcon;
