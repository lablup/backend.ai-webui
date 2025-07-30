import { default as logo } from './Ceph.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAICephIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAICephIcon: React.FC<BAICephIconProps> = (props) => {
  return (
    <Icon
      component={logo}
      style={{
        color: '#EF424D',
        ...(props.style || {}),
      }}
    />
  );
};

export default BAICephIcon;
