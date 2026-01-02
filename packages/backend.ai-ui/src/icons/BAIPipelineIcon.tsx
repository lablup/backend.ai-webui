import { default as logo } from './Pipeline.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPipelineIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIPipelineIcon: React.FC<BAIPipelineIconProps> = ({
  'aria-label': ariaLabel = 'pipeline',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIPipelineIcon;
