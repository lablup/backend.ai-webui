import { ReactComponent as logo } from './Endpoints.svg';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface EndpointsIconProps extends IconComponentProps {}

const EndpointsIcon: React.FC<EndpointsIconProps> = (props) => {
  return <Icon component={logo} />;
};

export default EndpointsIcon;
