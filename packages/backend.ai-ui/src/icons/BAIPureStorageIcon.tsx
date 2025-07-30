import { default as logo } from './PureStorage.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPureStorageIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIPureStorageIcon: React.FC<BAIPureStorageIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIPureStorageIcon;
