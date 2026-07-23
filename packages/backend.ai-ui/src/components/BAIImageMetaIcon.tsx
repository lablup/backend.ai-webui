import { useBAIImageMetaData } from './provider';
import React from 'react';

export interface BAIImageMetaIconProps {
  /** Full image name (e.g. `cr.backend.ai/multiarch/python:3.9-ubuntu20.04@x86_64`). */
  image?: string | null;
  style?: React.CSSProperties;
  alt?: string;
}

/**
 * v2/package counterpart of the React app's `ImageMetaIcon`. Resolves the
 * framework icon URL for an image by joining the `imagePath` provided via
 * `BAIMetaDataProvider` with the icon filename declared in the image metadata
 * (`imageInfo[].icon`, falling back to `default.png`). Renders nothing when
 * the host app has not provided an `imagePath` — the package never bundles or
 * resolves app asset paths on its own.
 */
const BAIImageMetaIcon: React.FC<BAIImageMetaIconProps> = ({
  image,
  style,
  alt = '',
}) => {
  'use memo';
  const [, { getImageIcon }] = useBAIImageMetaData();
  const src = getImageIcon(image);

  return src ? (
    <img
      src={src}
      style={{
        width: '1em',
        height: '1em',
        verticalAlign: 'middle',
        ...style,
      }}
      alt={alt}
    />
  ) : null;
};

export default BAIImageMetaIcon;
