import { default as logo } from './CalculateResource.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAICalculateResourceIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAICalculateResourceIcon: React.FC<BAICalculateResourceIconProps> = ({
  'aria-label': ariaLabel = 'calculate resource',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAICalculateResourceIcon;
