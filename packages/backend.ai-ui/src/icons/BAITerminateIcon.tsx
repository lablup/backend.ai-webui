import { default as logo } from './Terminate.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITerminateIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAITerminateIcon: React.FC<BAITerminateIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAITerminateIcon;
