import { default as logo } from './InteractiveSession.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIInteractiveSessionIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIInteractiveSessionIcon: React.FC<BAIInteractiveSessionIconProps> = ({
  'aria-label': ariaLabel = 'interactive session',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIInteractiveSessionIcon;
