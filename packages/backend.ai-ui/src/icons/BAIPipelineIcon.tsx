import { default as logo } from './Pipeline.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAIPipelineIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIPipelineIcon: React.FC<BAIPipelineIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIPipelineIcon;
