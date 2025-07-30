import { default as logo } from './ExampleStart.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIExampleStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIExampleStartIcon: React.FC<BAIExampleStartIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIExampleStartIcon;
