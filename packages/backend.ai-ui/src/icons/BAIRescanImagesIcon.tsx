import { default as logo } from './RescanImages.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIRescanImagesIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIRescanImagesIcon: React.FC<BAIRescanImagesIconProps> = ({
  'aria-label': ariaLabel = 'rescan images',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIRescanImagesIcon;
