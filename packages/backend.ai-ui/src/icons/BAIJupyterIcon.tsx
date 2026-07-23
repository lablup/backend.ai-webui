import { default as logo } from './Jupyter.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

// https://jupyter.org/governance/trademarks.html
// https://github.com/jupyter/design/tree/main/logos/Logo%20Mark
interface BAIJupyterIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAIJupyterIcon: React.FC<BAIJupyterIconProps> = ({
  'aria-label': ariaLabel = 'jupyter',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAIJupyterIcon;
