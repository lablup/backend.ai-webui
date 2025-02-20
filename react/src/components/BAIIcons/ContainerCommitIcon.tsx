import { ReactComponent as logo } from './ContainerCommit.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ContainerCommitIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ContainerCommitIcon: React.FC<ContainerCommitIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ContainerCommitIcon;
