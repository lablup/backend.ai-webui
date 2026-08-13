import { default as logo } from './PureStorage.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIPureStorageIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIPureStorageIcon: React.FC<BAIPureStorageIconProps> = ({
  'aria-label': ariaLabel = 'pure storage',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIPureStorageIcon;
