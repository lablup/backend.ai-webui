import { default as logo } from './URLStart.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIURLStartIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIURLStartIcon: React.FC<BAIURLStartIconProps> = ({
  'aria-label': ariaLabel = 'url start',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIURLStartIcon;
