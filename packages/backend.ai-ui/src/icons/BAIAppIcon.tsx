import { default as logo } from './App.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIAppIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIAppIcon: React.FC<BAIAppIconProps> = ({
  'aria-label': ariaLabel = 'app',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIAppIcon;
