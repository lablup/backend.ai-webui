import { default as logo } from './List.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIListIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIListIcon: React.FC<BAIListIconProps> = ({
  'aria-label': ariaLabel = 'list',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIListIcon;
