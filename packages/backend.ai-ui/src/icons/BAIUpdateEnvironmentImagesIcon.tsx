import { default as logo } from './UpdateEnvironmentImages.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIUpdateEnvironmentImagesIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIUpdateEnvironmentImagesIcon: React.FC<
  BAIUpdateEnvironmentImagesIconProps
> = ({ 'aria-label': ariaLabel = 'update environment images', ...props }) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIUpdateEnvironmentImagesIcon;
