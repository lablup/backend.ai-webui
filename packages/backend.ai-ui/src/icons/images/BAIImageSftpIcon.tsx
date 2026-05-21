import { default as src } from './sftp.png';
import React from 'react';

interface BAIImageSftpIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `sftp.png` (see `image_metadata.json`). */
const BAIImageSftpIcon: React.FC<BAIImageSftpIconProps> = ({
  alt = 'sftp',
  style,
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '1em', height: '1em', verticalAlign: 'middle', ...style }}
      {...props}
    />
  );
};

export default BAIImageSftpIcon;
