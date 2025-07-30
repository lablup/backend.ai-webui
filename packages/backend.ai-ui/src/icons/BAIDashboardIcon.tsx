import { default as logo } from './Dashboard.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIDashboardIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIDashboardIcon: React.FC<BAIDashboardIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIDashboardIcon;
