import React from "react";
import { useBackendaiImageMetaData } from "../hooks";

const ImageMetaIcon: React.FC<{
  image: string | null;
  style?: React.CSSProperties;
  border?: boolean;
  alt?: string | null;
}> = ({ image, style = {} }, bordered, alt="") => {
  const [, { getImageIcon }] = useBackendaiImageMetaData();

  return (
    <div>
      <img
        src={getImageIcon(image)}
        style={{
          width: "1.5em",
          height: "1.5em",
          ...style,
        }}
        alt={alt}
      />
    </div>
  );
};

export default React.memo(ImageMetaIcon);
