import { ReactComponent as logo } from './NewFolder.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface NewFolderIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const NewFolderIcon: React.FC<NewFolderIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default NewFolderIcon;
