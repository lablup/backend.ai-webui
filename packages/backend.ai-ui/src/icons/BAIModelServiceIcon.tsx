import { default as logo } from './ModelService.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIModelServiceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIModelServiceIcon: React.FC<BAIModelServiceIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIModelServiceIcon;
