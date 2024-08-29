import { ReactComponent as logo } from './Sessions.svg';
import Icon from '@ant-design/icons';
import {
  CustomIconComponentProps,
  IconComponentProps,
} from '@ant-design/icons/lib/components/Icon';

interface SessionsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const SessionsIcon: React.FC<SessionsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default SessionsIcon;
