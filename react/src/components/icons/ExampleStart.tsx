import { ReactComponent as logo } from './ExampleStart.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ExampleStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ExampleStartIcon: React.FC<ExampleStartIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ExampleStartIcon;
