import { default as logo } from './Restore.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIRestoreIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIRestoreIcon: React.FC<BAIRestoreIconProps> = ({
  'aria-label': ariaLabel = 'restore',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIRestoreIcon;
