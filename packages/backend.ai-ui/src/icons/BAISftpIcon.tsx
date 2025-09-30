import { default as logo } from './Sftp.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISftpIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAISftpIcon: React.FC<BAISftpIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAISftpIcon;
