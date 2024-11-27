import { ReactComponent as logo } from './nvidia.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface CustomIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  size?: number;
}

const NvidiaIcon: React.FC<CustomIconProps> = (props) => {
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

export default NvidiaIcon;
