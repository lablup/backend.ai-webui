import { default as logo } from './InteractiveSession.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIInteractiveSessionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIInteractiveSessionIcon: React.FC<BAIInteractiveSessionIconProps> = (
  props,
) => {
  return <Icon component={logo} {...props} />;
};

export default BAIInteractiveSessionIcon;
