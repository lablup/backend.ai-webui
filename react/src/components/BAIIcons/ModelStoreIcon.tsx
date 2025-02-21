import { ReactComponent as logo } from './ModelStore.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ModelStoreIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ModelStoreIcon: React.FC<ModelStoreIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ModelStoreIcon;
