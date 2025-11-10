import { default as logo } from './Jupyter.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

// https://jupyter.org/governance/trademarks.html
// https://github.com/jupyter/design/tree/main/logos/Logo%20Mark
interface BAIHuggingFaceIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const BAIJupyterIcon: React.FC<BAIHuggingFaceIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default BAIJupyterIcon;
