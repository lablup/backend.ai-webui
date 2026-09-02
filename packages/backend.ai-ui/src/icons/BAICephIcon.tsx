import { default as logo } from './Ceph.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAICephIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
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
