import { default as logo } from './Sessions.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISessionsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAISessionsIcon: React.FC<BAISessionsIconProps> = ({
  'aria-label': ariaLabel = 'sessions',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAISessionsIcon;
