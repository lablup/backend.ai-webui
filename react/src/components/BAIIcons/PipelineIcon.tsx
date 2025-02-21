import { ReactComponent as logo } from './Pipeline.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface PipelineIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const PipelineIcon: React.FC<PipelineIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default PipelineIcon;
