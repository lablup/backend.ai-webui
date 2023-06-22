import React, { useMemo } from "react";
import { useBackendaiImageMetaData } from "../hooks";
import _ from "lodash";

const ImageMetaIcon: React.FC<{
  image: string | null;
  style?: React.CSSProperties;
  border?: boolean;
}> = ({ image, style = {} }, bordered) => {
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
      />
    </div>
  );
};

export default React.memo(ImageMetaIcon);
