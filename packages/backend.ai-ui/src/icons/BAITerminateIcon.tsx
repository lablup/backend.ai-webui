import { default as logo } from './Terminate.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITerminateIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAITerminateIcon: React.FC<BAITerminateIconProps> = ({
  'aria-label': ariaLabel = 'terminate',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITerminateIcon;
