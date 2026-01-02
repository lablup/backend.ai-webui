import { default as logo } from './UpdateEnvironmentImages.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIUpdateEnvironmentImagesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIUpdateEnvironmentImagesIcon: React.FC<
  BAIUpdateEnvironmentImagesIconProps
> = ({ 'aria-label': ariaLabel = 'update environment images', ...props }) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIUpdateEnvironmentImagesIcon;
