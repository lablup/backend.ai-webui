import { default as logo } from './UserOutlined.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIUserOutlinedIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIUserOutlinedIcon: React.FC<BAIUserOutlinedIconProps> = ({
  'aria-label': ariaLabel = 'user',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIUserOutlinedIcon;
