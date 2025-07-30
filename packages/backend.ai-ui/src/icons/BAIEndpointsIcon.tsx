import { default as logo } from './Endpoints.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIEndpointsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIEndpointsIcon: React.FC<BAIEndpointsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIEndpointsIcon;
