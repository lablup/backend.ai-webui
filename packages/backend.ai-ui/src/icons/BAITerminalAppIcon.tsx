import { default as logo } from './TerminalApp.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITerminalAppIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAITerminalAppIcon: React.FC<BAITerminalAppIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAITerminalAppIcon;
