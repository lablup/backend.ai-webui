import { default as logo } from './Endpoints.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIEndpointsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIEndpointsIcon: React.FC<BAIEndpointsIconProps> = ({
  'aria-label': ariaLabel = 'endpoints',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIEndpointsIcon;
