/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNameTitleNodeFragment$key } from '../__generated__/VFolderNameTitleNodeFragment.graphql';
import { Heading } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { graphql, useFragment } from 'react-relay';

const VFolderNameTitle: React.FC<{
  vfolderNodeFrgmt?: VFolderNameTitleNodeFragment$key | null;
}> = ({ vfolderNodeFrgmt, ...props }) => {
  const vfolderNode = useFragment(
    graphql`
      fragment VFolderNameTitleNodeFragment on VirtualFolderNode {
        name
      }
    `,
    vfolderNodeFrgmt,
  );

  return (
    // `level={3}` matches the V2 twin (`EditableVFolderNameV2`), which renders
    // the same vfolder-name title on the new Data page — one visual decision
    // for both (MAPPING §4: the antd/Astryx heading ramps differ, so `level`
    // is a choice, not a rename). `ellipsis` -> `maxLines={1}`.
    // PILOT-DECISION: the `marginTop: token.marginSM` is dropped. Vertical
    // rhythm belongs to the frame, not to the heading ("frame first"), and no
    // live surface renders this component today — only its Relay fragment is
    // spread (FolderExplorerHeader / FolderExplorerModal).
    <Tooltip content={vfolderNode?.name} {...props}>
      <Heading level={3} maxLines={1}>
        {vfolderNode?.name}
      </Heading>
    </Tooltip>
  );
};

export default VFolderNameTitle;
