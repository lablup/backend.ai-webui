import { default as logo } from './RecalculateResources.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIRecalculateResourcesIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIRecalculateResourcesIcon: React.FC<
  BAIRecalculateResourcesIconProps
> = ({ 'aria-label': ariaLabel = 'recalculate resources', ...props }) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIRecalculateResourcesIcon;
