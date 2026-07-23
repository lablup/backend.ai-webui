import { default as logo } from './StartCircle.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIStartCircleIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIStartCircleIcon: React.FC<BAIStartCircleIconProps> = ({
  'aria-label': ariaLabel = 'start',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIStartCircleIcon;
