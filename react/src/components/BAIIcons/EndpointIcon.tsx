import { ReactComponent as logo } from './Endpoint.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface EndpointProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const Endpoint: React.FC<EndpointProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default Endpoint;
