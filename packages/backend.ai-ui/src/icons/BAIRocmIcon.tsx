import Icon, { CustomIconComponentProps } from './iconShim';
import { default as logo } from './rocm.svg?react';

interface BAIRocmIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIRocmIcon: React.FC<BAIRocmIconProps> = ({
  'aria-label': ariaLabel = 'rocm',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIRocmIcon;
