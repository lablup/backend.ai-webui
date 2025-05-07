import { ReactComponent as logo } from './Ceph.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface CephIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const CephIcon: React.FC<CephIconProps> = (props) => {
  return (
    <Icon
      component={logo}
      style={{
        color: '#EF424D',
        ...(props.style || {}),
      }}
    />
  );
};

export default CephIcon;
