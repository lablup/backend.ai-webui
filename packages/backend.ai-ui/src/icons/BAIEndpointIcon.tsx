import { default as logo } from './Endpoint.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIEndpointIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIEndpointIcon: React.FC<BAIEndpointIconProps> = ({
  'aria-label': ariaLabel = 'endpoint',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIEndpointIcon;
