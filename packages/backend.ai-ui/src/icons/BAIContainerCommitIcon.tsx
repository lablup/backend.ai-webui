import { default as logo } from './ContainerCommit.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIContainerCommitIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIContainerCommitIcon: React.FC<BAIContainerCommitIconProps> = (
  props,
) => {
  return <Icon component={logo} {...props} />;
};

export default BAIContainerCommitIcon;
