import { default as logo } from './Trails.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITrailsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAITrailsIcon: React.FC<BAITrailsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAITrailsIcon;
