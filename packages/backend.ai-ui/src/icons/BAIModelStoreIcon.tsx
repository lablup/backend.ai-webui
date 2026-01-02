import { default as logo } from './ModelStore.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIModelStoreIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIModelStoreIcon: React.FC<BAIModelStoreIconProps> = ({
  'aria-label': ariaLabel = 'model store',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIModelStoreIcon;
