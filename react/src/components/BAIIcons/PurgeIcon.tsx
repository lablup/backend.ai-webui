import { ReactComponent as logo } from './Purge.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface PurgeIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const PurgeIcon: React.FC<PurgeIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default PurgeIcon;
