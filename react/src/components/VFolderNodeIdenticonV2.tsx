/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeIdenticonV2Fragment$key } from '../__generated__/VFolderNodeIdenticonV2Fragment.graphql';
import { createAvatar } from '@dicebear/core';
import * as shapes from '@dicebear/shapes';
import { theme } from 'antd';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface VFolderNodeIdenticonV2Props {
  vfolderNodeIdenticonFrgmt: VFolderNodeIdenticonV2Fragment$key;
  style?: React.CSSProperties;
}

const VFolderNodeIdenticonV2: React.FC<VFolderNodeIdenticonV2Props> = ({
  vfolderNodeIdenticonFrgmt,
  style,
}) => {
  const { token } = theme.useToken();
  const vfolder = useFragment(
    graphql`
      fragment VFolderNodeIdenticonV2Fragment on VFolder {
        id
      }
    `,
    vfolderNodeIdenticonFrgmt,
  );

  return (
    <img
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      style={{
        borderRadius: '0.25em',
        width: '1em',
        height: '1em',
        borderWidth: 0.5,
        borderStyle: 'solid',
        borderColor: token.colorBorder,
        userSelect: 'none',
        ...style,
      }}
      src={createAvatar(shapes, {
        seed: vfolder?.id,
        shape3: [],
      })?.toDataUri()}
      // Identicon is purely decorative next to the folder name — empty
      // alt text prevents screen readers from announcing redundant content.
      alt=""
    />
  );
};

export default VFolderNodeIdenticonV2;
