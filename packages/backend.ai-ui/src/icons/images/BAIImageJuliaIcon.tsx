import { default as src } from './julia.png';
import React from 'react';

interface BAIImageJuliaIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `julia.png` (see `image_metadata.json`). */
const BAIImageJuliaIcon: React.FC<BAIImageJuliaIconProps> = ({
  alt = 'julia',
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

export default BAIImageJuliaIcon;
