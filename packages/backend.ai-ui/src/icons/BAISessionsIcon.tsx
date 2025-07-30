import { default as logo } from './Sessions.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISessionsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAISessionsIcon: React.FC<BAISessionsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAISessionsIcon;
