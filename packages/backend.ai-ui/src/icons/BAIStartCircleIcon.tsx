import { default as logo } from './StartCircle.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIStartCircleIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIStartCircleIcon: React.FC<BAIStartCircleIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIStartCircleIcon;
