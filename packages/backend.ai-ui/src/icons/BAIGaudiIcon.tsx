import { default as logo } from './gaudi.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIGaudiIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIGaudiIcon: React.FC<BAIGaudiIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIGaudiIcon;
