import { ReactComponent as logo } from './Pipelines.svg';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface PipelinesIconProps extends IconComponentProps {}

const PipelinesIcon: React.FC<PipelinesIconProps> = (props) => {
  return <Icon component={logo} />;
};

export default PipelinesIcon;
