import { default as logo } from './UserUnion.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIUserUnionIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIUserUnionIcon: React.FC<BAIUserUnionIconProps> = ({
  'aria-label': ariaLabel = 'user group',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIUserUnionIcon;
