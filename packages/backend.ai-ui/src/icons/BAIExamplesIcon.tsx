import { default as logo } from './Examples.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIExamplesIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIExamplesIcon: React.FC<BAIExamplesIconProps> = ({
  'aria-label': ariaLabel = 'examples',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIExamplesIcon;
