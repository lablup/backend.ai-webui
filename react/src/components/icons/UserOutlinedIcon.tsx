import { ReactComponent as logo } from './UserOutlined.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface UserOutlinedIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const UserOutlinedIcon: React.FC<UserOutlinedIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default UserOutlinedIcon;
