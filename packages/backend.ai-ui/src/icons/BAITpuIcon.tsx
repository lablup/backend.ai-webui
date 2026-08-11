import Icon, { CustomIconComponentProps } from './iconShim';
import { default as logo } from './tpu.svg?react';

interface BAITpuIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAITpuIcon: React.FC<BAITpuIconProps> = ({
  'aria-label': ariaLabel = 'tpu',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITpuIcon;
