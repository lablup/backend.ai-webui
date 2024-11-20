import { ReactComponent as logo } from './Examples.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ExamplesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ExamplesIcon: React.FC<ExamplesIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ExamplesIcon;
