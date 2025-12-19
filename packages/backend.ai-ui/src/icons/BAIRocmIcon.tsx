import { default as logo } from './rocm.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRocmIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIRocmIcon: React.FC<BAIRocmIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIRocmIcon;
