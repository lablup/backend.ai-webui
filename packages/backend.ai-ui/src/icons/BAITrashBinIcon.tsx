import { default as logo } from './TrashBin.svg?react';
import Icon, { CustomIconComponentProps } from './iconShim';

interface BAITrashBinIconProps extends Omit<
  CustomIconComponentProps,
  'width' | 'height' | 'fill'
> {
  'aria-label'?: string;
}

const BAITrashBinIcon: React.FC<BAITrashBinIconProps> = ({
  'aria-label': ariaLabel = 'trash bin',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITrashBinIcon;
