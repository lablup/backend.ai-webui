import { default as logo } from './SessionStart.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAISessionStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAISessionStartIcon: React.FC<BAISessionStartIconProps> = ({
  'aria-label': ariaLabel = 'session start',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAISessionStartIcon;
