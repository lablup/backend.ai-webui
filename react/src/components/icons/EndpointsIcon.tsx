import { ReactComponent as logo } from './Endpoints.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface EndpointsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const EndpointsIcon: React.FC<EndpointsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default EndpointsIcon;
