import { default as logo } from './rebel.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRebelIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIRebelIcon: React.FC<BAIRebelIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIRebelIcon;
