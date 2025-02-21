import { ReactComponent as logo } from './CalculateResource.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface CalculateResourceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const CalculateResourceIcon: React.FC<CalculateResourceIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default CalculateResourceIcon;
