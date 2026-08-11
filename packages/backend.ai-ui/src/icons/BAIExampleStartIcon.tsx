import { default as logo } from './ExampleStart.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAIExampleStartIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAIExampleStartIcon: React.FC<BAIExampleStartIconProps> = ({
  'aria-label': ariaLabel = 'example start',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIExampleStartIcon;
