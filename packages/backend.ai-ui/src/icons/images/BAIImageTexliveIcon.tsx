import { default as src } from './texlive.png';
import React from 'react';

interface BAIImageTexliveIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `texlive.png` (see `image_metadata.json`). */
const BAIImageTexliveIcon: React.FC<BAIImageTexliveIconProps> = ({
  alt = 'texlive',
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

export default BAIImageTexliveIcon;
