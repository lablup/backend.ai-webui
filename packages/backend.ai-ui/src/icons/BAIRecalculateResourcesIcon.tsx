import { default as logo } from './RecalculateResources.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRecalculateResourcesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIRecalculateResourcesIcon: React.FC<
  BAIRecalculateResourcesIconProps
> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIRecalculateResourcesIcon;
