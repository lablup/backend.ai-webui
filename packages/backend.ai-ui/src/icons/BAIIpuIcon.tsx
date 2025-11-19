import { default as logo } from './ipu.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIIpuIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIIpuIcon: React.FC<BAIIpuIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIIpuIcon;
