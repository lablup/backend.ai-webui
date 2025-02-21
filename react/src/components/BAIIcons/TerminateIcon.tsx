import { ReactComponent as logo } from './Terminate.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface TerminateIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const TerminateIcon: React.FC<TerminateIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default TerminateIcon;
