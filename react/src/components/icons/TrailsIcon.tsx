import { ReactComponent as logo } from './Trails.svg';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface TrailsIconProps extends IconComponentProps {}

const TrailsIcon: React.FC<TrailsIconProps> = (props) => {
  return <Icon component={logo} />;
};

export default TrailsIcon;
