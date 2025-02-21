import { ReactComponent as logo } from './SystemMonitor.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface SystemMonitorIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const SystemMonitorIcon: React.FC<SystemMonitorIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default SystemMonitorIcon;
