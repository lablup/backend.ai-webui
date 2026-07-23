import { default as logo } from './ExampleStart.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIExampleStartIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIExampleStartIcon: React.FC<BAIExampleStartIconProps> = ({
  'aria-label': ariaLabel = 'example start',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIExampleStartIcon;
