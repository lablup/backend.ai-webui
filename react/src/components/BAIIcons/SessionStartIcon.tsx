import { ReactComponent as logo } from './SessionStart.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface SessionStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const SessionStartIcon: React.FC<SessionStartIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default SessionStartIcon;
