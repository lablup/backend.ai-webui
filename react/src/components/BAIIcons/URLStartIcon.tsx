import { ReactComponent as logo } from './URLStart.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface URLStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const URLStartIcon: React.FC<URLStartIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default URLStartIcon;
