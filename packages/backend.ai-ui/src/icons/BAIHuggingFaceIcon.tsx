import { default as logo } from './HuggingFace.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIHuggingFaceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIHuggingFaceIcon: React.FC<BAIHuggingFaceIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIHuggingFaceIcon;
