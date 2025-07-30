import { default as logo } from './Models.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIModelsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIModelsIcon: React.FC<BAIModelsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIModelsIcon;
