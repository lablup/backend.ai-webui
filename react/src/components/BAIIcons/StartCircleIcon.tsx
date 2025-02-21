import { ReactComponent as logo } from './StartCircle.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface StartCircleIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const StartCircleIcon: React.FC<StartCircleIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default StartCircleIcon;
