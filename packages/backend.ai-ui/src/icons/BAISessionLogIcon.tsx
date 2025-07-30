import { default as logo } from './SessionLog.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISessionLogIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAISessionLogIcon: React.FC<BAISessionLogIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAISessionLogIcon;
