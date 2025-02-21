import { ReactComponent as logo } from './List.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface ListIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const ListIcon: React.FC<ListIconProps> = (props) => {
  return <Icon component={logo} {...props} />;
};

export default ListIcon;
