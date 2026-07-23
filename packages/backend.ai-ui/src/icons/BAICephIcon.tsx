import { default as logo } from './Ceph.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAICephIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAICephIcon: React.FC<BAICephIconProps> = ({
  'aria-label': ariaLabel = 'ceph',
  ...props
}) => {
  return (
    <Icon
      component={logo}
      aria-label={ariaLabel}
      style={{
        color: '#EF424D',
        ...(props.style || {}),
      }}
      {...props}
    />
  );
};

export default BAICephIcon;
