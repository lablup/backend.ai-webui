import { useBackendaiImageMetaData } from '../hooks';
import React from 'react';

const ImageMetaIcon: React.FC<{
  image?: string | null;
  style?: React.CSSProperties;
  border?: boolean;
  alt?: string | null;
}> = ({ image, style = {} }, bordered, alt = '') => {
  const [, { getImageIcon }] = useBackendaiImageMetaData();

  return (
    <img
      src={getImageIcon(image)}
      style={{
        width: '1em',
        height: '1em',
        ...style,
      }}
      alt={alt}
    />
  );
};

export default React.memo(ImageMetaIcon);
