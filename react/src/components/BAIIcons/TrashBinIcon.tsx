import { ReactComponent as logo } from './TrashBin.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface TrashBinIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const TrashBinIcon: React.FC<TrashBinIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default TrashBinIcon;
