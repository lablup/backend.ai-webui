/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderLazyViewV2Query } from '../__generated__/VFolderLazyViewV2Query.graphql';
import { useWebUINavigate } from '../hooks';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex, toLocalId } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface VFolderLazyViewV2Props {
  uuid: string;
  clickable?: boolean;
}
const VFolderLazyViewV2: React.FC<VFolderLazyViewV2Props> = ({
  uuid,
  clickable,
}) => {
  const location = useLocation();

  const webuiNavigate = useWebUINavigate();

  const { vfolderNode } = useLazyLoadQuery<VFolderLazyViewV2Query>(
    graphql`
      query VFolderLazyViewV2Query($vfolderId: UUID!) {
        vfolderNode: vfolderV2(vfolderId: $vfolderId) {
          id @required(action: THROW)
          metadata {
            name
          }
          ...VFolderNodeIdenticonV2Fragment
        }
      }
    `,
    { vfolderId: uuid },
  );

  return (
    <>
      {vfolderNode && (
        <BAIFlex align="center" gap="xs">
          <VFolderNodeIdenticonV2 vfolderNodeIdenticonFrgmt={vfolderNode} />
          {clickable ? (
            // p3-a D3: pure-`onClick` -> Astryx `Link` (link-styled button).
            <Link
              onClick={() => {
                webuiNavigate({
                  pathname: location.pathname,
                  search: new URLSearchParams({
                    folder: toLocalId(vfolderNode.id),
                  }).toString(),
                });
              }}
            >
              {vfolderNode.metadata?.name}
            </Link>
          ) : (
            <Text>{vfolderNode.metadata?.name}</Text>
          )}
        </BAIFlex>
      )}
    </>
  );
};

export default VFolderLazyViewV2;
