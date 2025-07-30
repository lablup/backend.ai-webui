import { default as logo } from './SystemMonitor.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISystemMonitorIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAISystemMonitorIcon: React.FC<BAISystemMonitorIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAISystemMonitorIcon;
