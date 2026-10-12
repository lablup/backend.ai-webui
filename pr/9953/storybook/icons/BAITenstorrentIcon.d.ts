import { CustomIconComponentProps } from './iconShim';
interface BAITenstorrentIconProps extends Omit<CustomIconComponentProps, 'width' | 'height' | 'fill'> {
    'aria-label'?: string;
}
declare const BAITenstorrentIcon: React.FC<BAITenstorrentIconProps>;
export default BAITenstorrentIcon;
