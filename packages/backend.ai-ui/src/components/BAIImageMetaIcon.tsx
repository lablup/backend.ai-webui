import { useBAIImageMetaData } from './provider';
import { CodeXml } from 'lucide-react';
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
 * (`imageInfo[].icon`). Images with no declared icon get a themed inline glyph
 * instead. Renders nothing when the host app has not provided an `imagePath` —
 * the package never bundles or resolves app asset paths on its own.
 */
const BAIImageMetaIcon: React.FC<BAIImageMetaIconProps> = ({
  image,
  style,
  alt = '',
}) => {
  'use memo';
  const [, { getImageIcon, hasImageIcon }] = useBAIImageMetaData();
  const src = getImageIcon(image);
  const iconStyle: React.CSSProperties = {
    width: '1em',
    height: '1em',
    verticalAlign: 'middle',
    ...style,
  };

  if (!src) return null;

  // The raster fallback is fixed dark ink, so images without a vendor icon get
  // a themed glyph instead (FR-3587).
  return hasImageIcon(image) ? (
    <img src={src} style={iconStyle} alt={alt} />
  ) : (
    <CodeXml
      style={{ color: 'var(--color-text-primary)', ...iconStyle }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    />
  );
};

export default BAIImageMetaIcon;
