/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeIdenticonV2Fragment$key } from '../__generated__/VFolderNodeIdenticonV2Fragment.graphql';
import { BAIVFolderIdenticon } from 'backend.ai-ui';
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
  const vfolder = useFragment(
    graphql`
      fragment VFolderNodeIdenticonV2Fragment on VFolder {
        id
      }
    `,
    vfolderNodeIdenticonFrgmt,
  );

  return <BAIVFolderIdenticon seed={vfolder?.id} style={style} />;
};

export default VFolderNodeIdenticonV2;
