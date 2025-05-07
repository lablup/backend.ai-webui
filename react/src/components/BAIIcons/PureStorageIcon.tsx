import { useThemeMode } from '../../hooks/useThemeMode';
import { ReactComponent as logo } from './PureStorage.svg';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface PureStorageIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {}

const PureStorageIcon: React.FC<PureStorageIconProps> = (props) => {
  const { isDarkMode } = useThemeMode();
  return (
    <Icon
      component={logo}
      {...props}
      style={{
        color: isDarkMode ? 'white' : '#FE5000',
        ...(props.style || {}),
      }}
    />
  );
};

export default PureStorageIcon;
