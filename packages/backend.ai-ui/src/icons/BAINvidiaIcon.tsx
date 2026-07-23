import { default as logo } from './nvidia.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAINvidiaIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
  size?: number;
}

const BAINvidiaIcon: React.FC<BAINvidiaIconProps> = ({
  'aria-label': ariaLabel = 'nvidia',
  size,
  ...props
}) => {
  return (
    <Icon
      component={logo}
      aria-label={ariaLabel}
      {...props}
      style={{
        color: '#76B900',
        fontSize: size,
        ...props.style,
      }}
    />
  );
};

export default BAINvidiaIcon;
