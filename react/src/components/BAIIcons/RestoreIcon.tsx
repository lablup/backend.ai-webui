import { ReactComponent as logo } from './Restore.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface RestoreIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const RestoreIcon: React.FC<RestoreIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default RestoreIcon;
