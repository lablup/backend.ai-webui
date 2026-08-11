import { default as logo } from './HuggingFace.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIHuggingFaceIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIHuggingFaceIcon: React.FC<BAIHuggingFaceIconProps> = ({
  'aria-label': ariaLabel = 'hugging face',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIHuggingFaceIcon;
