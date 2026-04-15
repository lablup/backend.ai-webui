/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderIdenticonV2Fragment$key } from '../__generated__/VFolderIdenticonV2Fragment.graphql';
import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { theme } from 'antd';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface VFolderIdenticonV2Props {
  vfolderFrgmt: VFolderIdenticonV2Fragment$key;
  style?: React.CSSProperties;
}

const VFolderIdenticonV2: React.FC<VFolderIdenticonV2Props> = ({
  vfolderFrgmt,
  style,
}) => {
  'use memo';
  const { token } = theme.useToken();
  const vfolder = useFragment(
    graphql`
      fragment VFolderIdenticonV2Fragment on VFolder {
        id @required(action: NONE)
      }
    `,
    vfolderFrgmt,
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
      alt="VFolder Identicon"
    />
  );
};

export default VFolderIdenticonV2;
