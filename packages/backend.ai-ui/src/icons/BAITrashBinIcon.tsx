import { default as logo } from './TrashBin.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITrashBinIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAITrashBinIcon: React.FC<BAITrashBinIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAITrashBinIcon;
