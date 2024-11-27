import { ReactComponent as logo } from './Models.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ModelsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ModelsIcon: React.FC<ModelsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ModelsIcon;
