import { default as logo } from './ShareAlt.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIShareAltIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIShareAltIcon: React.FC<BAIShareAltIconProps> = ({
  'aria-label': ariaLabel = 'share',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIShareAltIcon;
