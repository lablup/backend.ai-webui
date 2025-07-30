import { default as logo } from './NewFolder.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAINewFolderIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAINewFolderIcon: React.FC<BAINewFolderIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAINewFolderIcon;
