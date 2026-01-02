import { default as logo } from './ModelService.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIModelServiceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIModelServiceIcon: React.FC<BAIModelServiceIconProps> = ({
  'aria-label': ariaLabel = 'model service',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIModelServiceIcon;
