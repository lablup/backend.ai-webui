import { default as src } from './octave.png';
import React from 'react';

interface BAIImageOctaveIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `octave.png` (see `image_metadata.json`). */
const BAIImageOctaveIcon: React.FC<BAIImageOctaveIconProps> = ({
  alt = 'octave',
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

export default BAIImageOctaveIcon;
