import { ReactComponent as logo } from './RescanImages.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface RescanImagesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const RescanImagesIcon: React.FC<RescanImagesIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default RescanImagesIcon;
