import { default as logo } from './BatchSession.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIBatchSessionIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIBatchSessionIcon: React.FC<BAIBatchSessionIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIBatchSessionIcon;
