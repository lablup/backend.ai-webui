import { default as logo } from './Purge.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPurgeIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIPurgeIcon: React.FC<BAIPurgeIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIPurgeIcon;
