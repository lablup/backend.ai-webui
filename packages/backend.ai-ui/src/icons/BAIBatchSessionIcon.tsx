import { default as logo } from './BatchSession.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIBatchSessionIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIBatchSessionIcon: React.FC<BAIBatchSessionIconProps> = ({
  'aria-label': ariaLabel = 'batch session',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIBatchSessionIcon;
