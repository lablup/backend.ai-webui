import { default as logo } from './Dashboard.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIDashboardIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIDashboardIcon: React.FC<BAIDashboardIconProps> = ({
  'aria-label': ariaLabel = 'dashboard',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIDashboardIcon;
