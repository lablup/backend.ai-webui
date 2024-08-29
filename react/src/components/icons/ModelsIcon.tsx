import { ReactComponent as logo } from './Models.svg';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ModelsIconProps extends IconComponentProps {}

const ModelsIcon: React.FC<ModelsIconProps> = (props) => {
  return <Icon component={logo} />;
};

export default ModelsIcon;
