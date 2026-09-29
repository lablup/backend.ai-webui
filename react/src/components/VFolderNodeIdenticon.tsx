/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeIdenticonFragment$key } from '../__generated__/VFolderNodeIdenticonFragment.graphql';
import { BAIVFolderIdenticon } from 'backend.ai-ui';
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
  const vfolder = useFragment(
    graphql`
      fragment VFolderNodeIdenticonFragment on VirtualFolderNode {
        id
      }
    `,
    vfolderNodeIdenticonFrgmt,
  );

  return <BAIVFolderIdenticon seed={vfolder?.id} style={style} />;
};

export default VFolderNodeIdenticon;
