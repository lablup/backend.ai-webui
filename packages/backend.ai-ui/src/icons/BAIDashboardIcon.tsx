import { default as logo } from './Dashboard.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIDashboardIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIDashboardIcon: React.FC<BAIDashboardIconProps> = ({
  'aria-label': ariaLabel = 'dashboard',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIDashboardIcon;
