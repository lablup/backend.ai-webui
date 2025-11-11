import { default as logo } from './Filebrowser.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIFileBrowserIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}
const BAIFileBrowserIcon: React.FC<BAIFileBrowserIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIFileBrowserIcon;
