import { default as logo } from './Examples.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIExamplesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIExamplesIcon: React.FC<BAIExamplesIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIExamplesIcon;
