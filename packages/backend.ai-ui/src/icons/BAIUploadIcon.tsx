import { default as logo } from './Upload.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIUploadIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIUploadIcon: React.FC<BAIUploadIconProps> = ({
  'aria-label': ariaLabel = 'upload',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIUploadIcon;
