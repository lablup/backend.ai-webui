import { default as logo } from './Endpoint.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIEndpointIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIEndpointIcon: React.FC<BAIEndpointIconProps> = ({
  'aria-label': ariaLabel = 'endpoint',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIEndpointIcon;
