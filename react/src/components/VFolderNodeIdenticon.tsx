/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeIdenticonFragment$key } from '../__generated__/VFolderNodeIdenticonFragment.graphql';
import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { theme } from 'antd';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface VFolderNodeIdenticonProps {
  vfolderNodeIdenticonFrgmt: VFolderNodeIdenticonFragment$key;
  style?: React.CSSProperties;
}

const VFolderNodeIdenticon: React.FC<VFolderNodeIdenticonProps> = ({
  vfolderNodeIdenticonFrgmt,
  style,
}) => {
  const { token } = theme.useToken();
  const vfolder = useFragment(
    graphql`
      fragment VFolderNodeIdenticonFragment on VirtualFolderNode {
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
      alt="VFolder Identicon"
    />
  );
};

export default VFolderNodeIdenticon;
