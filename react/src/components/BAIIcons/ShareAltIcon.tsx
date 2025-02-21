import { ReactComponent as logo } from './ShareAlt.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ShareAltIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ShareAltIcon: React.FC<ShareAltIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ShareAltIcon;
