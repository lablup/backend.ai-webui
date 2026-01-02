import { default as logo } from './InteractiveSession.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIInteractiveSessionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIInteractiveSessionIcon: React.FC<BAIInteractiveSessionIconProps> = ({
  'aria-label': ariaLabel = 'interactive session',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIInteractiveSessionIcon;
