import { default as logo } from './SessionLog.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISessionLogIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAISessionLogIcon: React.FC<BAISessionLogIconProps> = ({
  'aria-label': ariaLabel = 'session log',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAISessionLogIcon;
