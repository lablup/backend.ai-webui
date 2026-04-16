import { toLocalId } from '../helper';
import BAIText, { type BAITextProps } from './BAIText';
import React from 'react';

export type BAIIdProps = Omit<BAITextProps, 'children'> &
  ({ uuid: string; globalId?: never } | { uuid?: never; globalId: string });

// Safely decode a Relay global id to its local id.
// Falls back to the raw input when the value is not a valid Relay global id
// (e.g., not base64, or decoded payload has no `:` separator), so a bad
// backend value doesn't crash the subtree.
const safeDecodeGlobalId = (globalId: string): string => {
  try {
    return toLocalId(globalId) ?? globalId;
  } catch {
    return globalId;
  }
};

const BAIId: React.FC<BAIIdProps> = ({
  uuid,
  globalId,
  copyable = true,
  ellipsis = true,
  monospace = true,
  style,
  ...restProps
}) => {
  const value = uuid ?? safeDecodeGlobalId(globalId as string);

  return (
    <BAIText
      copyable={copyable}
      ellipsis={ellipsis}
      monospace={monospace}
      style={{ maxWidth: 100, ...style }}
      {...restProps}
    >
      {value}
    </BAIText>
  );
};

export default BAIId;
