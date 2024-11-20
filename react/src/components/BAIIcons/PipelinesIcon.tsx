import { ReactComponent as logo } from './Pipelines.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface PipelinesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const PipelinesIcon: React.FC<PipelinesIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default PipelinesIcon;
