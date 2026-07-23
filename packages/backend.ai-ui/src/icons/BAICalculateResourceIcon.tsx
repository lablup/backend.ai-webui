import { default as logo } from './CalculateResource.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAICalculateResourceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAICalculateResourceIcon: React.FC<BAICalculateResourceIconProps> = ({
  'aria-label': ariaLabel = 'calculate resource',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAICalculateResourceIcon;
