import { default as logo } from './Purge.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPurgeIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIPurgeIcon: React.FC<BAIPurgeIconProps> = ({
  'aria-label': ariaLabel = 'purge',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIPurgeIcon;
