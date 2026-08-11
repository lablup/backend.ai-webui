import Icon, { CustomIconComponentProps } from './iconShim';
import { default as logo } from './ipu.svg?react';

interface BAIIpuIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIIpuIcon: React.FC<BAIIpuIconProps> = ({
  'aria-label': ariaLabel = 'ipu',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIIpuIcon;
