import { ReactComponent as logo } from './Sessions.svg';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface SessionsIconProps extends IconComponentProps {}

const SessionsIcon: React.FC<SessionsIconProps> = (props) => {
  return <Icon component={logo} />;
};

export default SessionsIcon;
