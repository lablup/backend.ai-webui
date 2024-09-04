import { ReactComponent as logo } from './BatchSession.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BatchSessionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BatchSessionIcon: React.FC<BatchSessionIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BatchSessionIcon;
