import { default as logo } from './CalculateResource.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAICalculateResourceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAICalculateResourceIcon: React.FC<BAICalculateResourceIconProps> = (
  props,
) => {
  return <Icon component={logo} {...props} />;
};

export default BAICalculateResourceIcon;
