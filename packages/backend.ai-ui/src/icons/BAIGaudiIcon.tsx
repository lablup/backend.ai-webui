import { default as logo } from './gaudi.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIGaudiIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIGaudiIcon: React.FC<BAIGaudiIconProps> = ({
  'aria-label': ariaLabel = 'gaudi',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIGaudiIcon;
