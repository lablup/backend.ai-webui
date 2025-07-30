import { default as logo } from './UserUnion.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIUserUnionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIUserUnionIcon: React.FC<BAIUserUnionIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIUserUnionIcon;
