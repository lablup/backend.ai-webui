import { default as logo } from './Pipelines.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIPipelinesIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIPipelinesIcon: React.FC<BAIPipelinesIconProps> = ({
  'aria-label': ariaLabel = 'pipelines',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIPipelinesIcon;
