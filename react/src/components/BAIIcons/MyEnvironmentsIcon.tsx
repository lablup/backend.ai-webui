import { ReactComponent as logo } from './MyEnvironments.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface MyEnvironmentsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const MyEnvironmentsIcon: React.FC<MyEnvironmentsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default MyEnvironmentsIcon;
