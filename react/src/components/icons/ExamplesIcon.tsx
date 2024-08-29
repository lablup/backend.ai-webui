import { ReactComponent as logo } from './Examples.svg';
import Icon from '@ant-design/icons';
import { IconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ExamplesIconProps extends IconComponentProps {}

const ExamplesIcon: React.FC<ExamplesIconProps> = (props) => {
  return <Icon component={logo} />;
};

export default ExamplesIcon;
