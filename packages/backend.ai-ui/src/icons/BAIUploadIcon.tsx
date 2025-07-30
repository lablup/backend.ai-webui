import { default as logo } from './Upload.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIUploadIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIUploadIcon: React.FC<BAIUploadIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIUploadIcon;
