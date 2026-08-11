import { default as logo } from './ModelService.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIModelServiceIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIModelServiceIcon: React.FC<BAIModelServiceIconProps> = ({
  'aria-label': ariaLabel = 'model service',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIModelServiceIcon;
