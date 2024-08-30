import { ReactComponent as logo } from './UpdateEnvironmentImages.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface UpdateEnvironmentImageIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const UpdateEnvironmentImageIcon: React.FC<UpdateEnvironmentImageIconProps> = (
  props,
) => {
  return <Icon component={logo} {...props} />;
};

export default UpdateEnvironmentImageIcon;
