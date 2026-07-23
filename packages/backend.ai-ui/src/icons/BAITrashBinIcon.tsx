import { default as logo } from './TrashBin.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITrashBinIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAITrashBinIcon: React.FC<BAITrashBinIconProps> = ({
  'aria-label': ariaLabel = 'trash bin',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITrashBinIcon;
