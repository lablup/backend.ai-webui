import { default as logo } from './MyEnvironments.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIMyEnvironmentsIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIMyEnvironmentsIcon: React.FC<BAIMyEnvironmentsIconProps> = ({
  'aria-label': ariaLabel = 'my environments',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIMyEnvironmentsIcon;
