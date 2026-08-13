import { default as logo } from './Filebrowser.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIFileBrowserIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIFileBrowserIcon: React.FC<BAIFileBrowserIconProps> = ({
  'aria-label': ariaLabel = 'file browser',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIFileBrowserIcon;
