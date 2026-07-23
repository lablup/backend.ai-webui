import { default as logo } from './TerminalApp.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITerminalAppIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAITerminalAppIcon: React.FC<BAITerminalAppIconProps> = ({
  'aria-label': ariaLabel = 'terminal',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITerminalAppIcon;
