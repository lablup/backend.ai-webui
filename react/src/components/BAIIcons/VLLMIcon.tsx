import { ReactComponent as logo } from './vllm-color.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface CustomIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  size?: number;
}

const VLLMIcon: React.FC<CustomIconProps> = (props) => {
  return (
    <Icon
      component={logo}
      {...props}
      style={{
        fontSize: props.size,
        ...props.style,
      }}
    />
  );
};

export default VLLMIcon;
