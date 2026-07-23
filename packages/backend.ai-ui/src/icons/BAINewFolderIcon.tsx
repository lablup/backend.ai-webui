import { default as logo } from './NewFolder.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAINewFolderIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAINewFolderIcon: React.FC<BAINewFolderIconProps> = ({
  'aria-label': ariaLabel = 'new folder',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAINewFolderIcon;
