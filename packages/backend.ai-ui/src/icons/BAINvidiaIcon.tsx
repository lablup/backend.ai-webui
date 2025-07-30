import { default as logo } from './nvidia.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAINvidiaIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  size?: number;
}

const BAINvidiaIcon: React.FC<BAINvidiaIconProps> = (props) => {
  return (
    <Icon
      component={logo}
      {...props}
      style={{
        color: '#76B900',
        fontSize: props.size,
        ...props.style,
      }}
    />
  );
};

export default BAINvidiaIcon;
