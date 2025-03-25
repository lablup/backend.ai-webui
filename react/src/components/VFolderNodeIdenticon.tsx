import { VFolderNodeIdenticonFragment$key } from './__generated__/VFolderNodeIdenticonFragment.graphql';
import { shapes } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment } from 'react-relay';

interface VFolderNodeIdenticonProps {
  vfolderNodeIdenticonFrgmt: VFolderNodeIdenticonFragment$key;
  style?: React.CSSProperties;
}

const VFolderNodeIdenticon: React.FC<VFolderNodeIdenticonProps> = ({
  vfolderNodeIdenticonFrgmt,
  ...style
}) => {
  const vfolder = useFragment(
    graphql`
      fragment VFolderNodeIdenticonFragment on VirtualFolderNode {
        id
        name
      }
    `,
    vfolderNodeIdenticonFrgmt,
  );

  return (
    <img
      {...style}
      src={createAvatar(shapes, {
        seed: vfolder?.id + vfolder?.name,
        shape3: [],
      })?.toDataUri()}
      alt="VFolder Identicon"
    />
  );
};

export default VFolderNodeIdenticon;
