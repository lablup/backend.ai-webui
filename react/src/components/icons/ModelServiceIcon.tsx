import { ReactComponent as logo } from './ModelService.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ModelServiceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ModelServiceIcon: React.FC<ModelServiceIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ModelServiceIcon;
