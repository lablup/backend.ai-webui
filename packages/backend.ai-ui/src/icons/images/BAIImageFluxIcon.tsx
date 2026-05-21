import { default as src } from './flux.png';
import React from 'react';

interface BAIImageFluxIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/** Bundled framework icon for `flux.png` (see `image_metadata.json`). */
const BAIImageFluxIcon: React.FC<BAIImageFluxIconProps> = ({
  alt = 'flux',
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

export default BAIImageFluxIcon;
