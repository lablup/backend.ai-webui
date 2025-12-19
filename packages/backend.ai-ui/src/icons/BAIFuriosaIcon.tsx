import { default as logo } from './furiosa.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIFuriosaIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIFuriosaIcon: React.FC<BAIFuriosaIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIFuriosaIcon;
