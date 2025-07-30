import { default as logo } from './URLStart.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIURLStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIURLStartIcon: React.FC<BAIURLStartIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIURLStartIcon;
