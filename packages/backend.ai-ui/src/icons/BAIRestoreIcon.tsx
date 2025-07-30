import { default as logo } from './Restore.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRestoreIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIRestoreIcon: React.FC<BAIRestoreIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIRestoreIcon;
