import { default as logo } from './SystemMonitor.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISystemMonitorIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAISystemMonitorIcon: React.FC<BAISystemMonitorIconProps> = ({
  'aria-label': ariaLabel = 'system monitor',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAISystemMonitorIcon;
