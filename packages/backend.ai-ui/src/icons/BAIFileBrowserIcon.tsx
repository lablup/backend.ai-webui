import { default as logo } from './Filebrowser.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIFileBrowserIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIFileBrowserIcon: React.FC<BAIFileBrowserIconProps> = ({
  'aria-label': ariaLabel = 'file browser',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIFileBrowserIcon;
