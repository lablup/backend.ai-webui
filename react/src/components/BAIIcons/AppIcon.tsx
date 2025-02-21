import { ReactComponent as logo } from './App.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface AppIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const AppIcon: React.FC<AppIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default AppIcon;
