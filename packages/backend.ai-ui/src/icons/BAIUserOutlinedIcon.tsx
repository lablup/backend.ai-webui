import { default as logo } from './UserOutlined.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIUserOutlinedIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIUserOutlinedIcon: React.FC<BAIUserOutlinedIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIUserOutlinedIcon;
