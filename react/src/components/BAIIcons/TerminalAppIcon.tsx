import { ReactComponent as logo } from './TerminalApp.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface TerminalAppIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const TerminalAppIcon: React.FC<TerminalAppIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default TerminalAppIcon;
