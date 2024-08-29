import { ReactComponent as logo } from './Trails.svg';
import Icon from '@ant-design/icons';
import {
  CustomIconComponentProps,
  IconComponentProps,
} from '@ant-design/icons/lib/components/Icon';

interface TrailsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const TrailsIcon: React.FC<TrailsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default TrailsIcon;
