import { default as logo } from './ModelStore.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIModelStoreIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIModelStoreIcon: React.FC<BAIModelStoreIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIModelStoreIcon;
