import { default as logo } from './SessionLog.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAISessionLogIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAISessionLogIcon: React.FC<BAISessionLogIconProps> = ({
  'aria-label': ariaLabel = 'session log',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAISessionLogIcon;
