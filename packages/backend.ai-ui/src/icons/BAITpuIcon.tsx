import { default as logo } from './tpu.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITpuIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAITpuIcon: React.FC<BAITpuIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAITpuIcon;
