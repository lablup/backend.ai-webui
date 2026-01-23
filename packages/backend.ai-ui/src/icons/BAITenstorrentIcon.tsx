import { default as logo } from './tenstorrent.svg?react';
import Icon from '@ant-design/icons';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface BAITenstorrentIconProps
  extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
  'aria-label'?: string;
}

const BAITenstorrentIcon: React.FC<BAITenstorrentIconProps> = ({
  'aria-label': ariaLabel = 'tenstorrent',
  ...props
}) => {
  return <Icon component={logo} aria-label={ariaLabel} {...props} />;
};

export default BAITenstorrentIcon;
