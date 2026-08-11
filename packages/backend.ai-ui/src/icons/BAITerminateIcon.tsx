import { default as logo } from './Terminate.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAITerminateIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAITerminateIcon: React.FC<BAITerminateIconProps> = ({
  'aria-label': ariaLabel = 'terminate',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITerminateIcon;
