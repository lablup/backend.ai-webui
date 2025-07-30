import { default as logo } from './SessionStart.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISessionStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAISessionStartIcon: React.FC<BAISessionStartIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAISessionStartIcon;
