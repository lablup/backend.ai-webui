import { ReactComponent as logo } from './UserUnion.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface UserUnionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const UserUnionIcon: React.FC<UserUnionIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default UserUnionIcon;
