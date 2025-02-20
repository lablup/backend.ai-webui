import { ReactComponent as logo } from './Upload.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface UploadIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const UploadIcon: React.FC<UploadIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default UploadIcon;
