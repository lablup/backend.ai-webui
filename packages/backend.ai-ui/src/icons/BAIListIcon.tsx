import { default as logo } from './List.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIListIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIListIcon: React.FC<BAIListIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIListIcon;
