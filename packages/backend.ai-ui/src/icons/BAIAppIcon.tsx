import { default as logo } from './App.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIAppIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIAppIcon: React.FC<BAIAppIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIAppIcon;
