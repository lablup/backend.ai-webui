import { default as logo } from './UpdateEnvironmentImages.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIUpdateEnvironmentImagesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIUpdateEnvironmentImagesIcon: React.FC<
  BAIUpdateEnvironmentImagesIconProps
> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIUpdateEnvironmentImagesIcon;
