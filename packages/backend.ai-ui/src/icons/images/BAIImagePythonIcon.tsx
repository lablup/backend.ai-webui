import { default as src } from './python.png';
import React from 'react';

interface BAIImagePythonIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `python.png` (see `image_metadata.json`). */
const BAIImagePythonIcon: React.FC<BAIImagePythonIconProps> = ({
  alt = 'python',
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

export default BAIImagePythonIcon;
