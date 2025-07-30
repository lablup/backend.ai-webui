import { default as logo } from './RescanImages.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRescanImagesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIRescanImagesIcon: React.FC<BAIRescanImagesIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIRescanImagesIcon;
