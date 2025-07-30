import { default as logo } from './Endpoint.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIEndpointIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIEndpointIcon: React.FC<BAIEndpointIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIEndpointIcon;
