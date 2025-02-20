import { ReactComponent as logo } from './Dashboard.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface DashboardIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const DashboardIcon: React.FC<DashboardIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default DashboardIcon;
