import { default as logo } from './UserUnion.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIUserUnionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIUserUnionIcon: React.FC<BAIUserUnionIconProps> = ({
  'aria-label': ariaLabel = 'user group',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIUserUnionIcon;
