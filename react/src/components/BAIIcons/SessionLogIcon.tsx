import { ReactComponent as logo } from './SessionLog.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface SessionLogIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const SessionLogIcon: React.FC<SessionLogIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default SessionLogIcon;
