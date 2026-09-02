import { default as logo } from './Sftp.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAISftpIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAISftpIcon: React.FC<BAISftpIconProps> = ({
  'aria-label': ariaLabel = 'sftp',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAISftpIcon;
