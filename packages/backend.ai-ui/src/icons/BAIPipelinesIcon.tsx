import { default as logo } from './Pipelines.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPipelinesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIPipelinesIcon: React.FC<BAIPipelinesIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIPipelinesIcon;
