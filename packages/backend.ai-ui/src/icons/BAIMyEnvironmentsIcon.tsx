import { default as logo } from './MyEnvironments.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIMyEnvironmentsIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIMyEnvironmentsIcon: React.FC<BAIMyEnvironmentsIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIMyEnvironmentsIcon;
