import { default as logo } from './furiosa.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIFuriosaIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIFuriosaIcon: React.FC<BAIFuriosaIconProps> = ({
  'aria-label': ariaLabel = 'furiosa',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIFuriosaIcon;
