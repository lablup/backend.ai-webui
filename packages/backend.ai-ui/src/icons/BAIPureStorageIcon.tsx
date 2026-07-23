import { default as logo } from './PureStorage.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPureStorageIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIPureStorageIcon: React.FC<BAIPureStorageIconProps> = ({
  'aria-label': ariaLabel = 'pure storage',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIPureStorageIcon;
