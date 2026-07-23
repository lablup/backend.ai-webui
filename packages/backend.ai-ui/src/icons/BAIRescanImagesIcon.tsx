import { default as logo } from './RescanImages.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRescanImagesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIRescanImagesIcon: React.FC<BAIRescanImagesIconProps> = ({
  'aria-label': ariaLabel = 'rescan images',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIRescanImagesIcon;
