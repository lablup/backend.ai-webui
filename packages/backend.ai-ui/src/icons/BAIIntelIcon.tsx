import Icon, { CustomIconComponentProps } from './iconShim';
import { default as logo } from './intel.svg?react';

interface BAIIntelIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIIntelIcon: React.FC<BAIIntelIconProps> = ({
  'aria-label': ariaLabel = 'intel',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIIntelIcon;
