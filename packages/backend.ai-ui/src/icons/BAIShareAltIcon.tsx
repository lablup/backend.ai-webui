import { default as logo } from './ShareAlt.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIShareAltIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIShareAltIcon: React.FC<BAIShareAltIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIShareAltIcon;
