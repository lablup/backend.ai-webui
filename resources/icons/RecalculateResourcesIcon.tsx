import { ReactComponent as logo } from './RecalculateResources.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface RecalculateResourcesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const RecalculateResourcesIcon: React.FC<RecalculateResourcesIconProps> = (
  props,
) => {
  return <Icon component={logo} {...props} />;
};

export default RecalculateResourcesIcon;
