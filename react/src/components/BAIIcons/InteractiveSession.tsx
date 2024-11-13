import { ReactComponent as logo } from './InteractiveSession.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface InteractiveSessionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const InteractiveSessionIcon: React.FC<InteractiveSessionIconProps> = (
  props,
) => {
  return <Icon component={logo} {...props} />;
};

export default InteractiveSessionIcon;
