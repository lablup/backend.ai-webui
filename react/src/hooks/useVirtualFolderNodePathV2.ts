/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useVirtualFolderNodePathV2Fragment$key } from '../__generated__/useVirtualFolderNodePathV2Fragment.graphql';
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export const useVirtualFolderPathV2 = (
  vfolderNodeFrgmt: useVirtualFolderNodePathV2Fragment$key,
) => {
  const vfolderNode = useFragment(
    graphql`
      fragment useVirtualFolderNodePathV2Fragment on VFolder {
        id
        metadata {
          quotaScopeId
        }
      }
    `,
    vfolderNodeFrgmt,
  );

  // `quotaScopeId` is nullable on V2 `VFolder`, so split on an empty fallback
  // to avoid `_.split(undefined, ':')`; default both destructured values to
  // empty strings so downstream string operations (`.replaceAll`, etc.) never
  // receive `undefined` when the source is missing a `:` delimiter.
  const [quotaScopeType = '', quotaScopeIdWithoutType = ''] = _.split(
    vfolderNode?.metadata?.quotaScopeId ?? '',
    ':',
  );
  const vfolderId = toLocalId(vfolderNode?.id);
  const vfolderIdPrefix1 = vfolderId.slice(0, 2);
  const vfolderIdPrefix2 = vfolderId.slice(2, 4);
  const vfolderIdRest = vfolderId.slice(4);
  const vfolderPath = quotaScopeIdWithoutType
    ? `${quotaScopeIdWithoutType.replaceAll('-', '')}/${vfolderIdPrefix1}/${vfolderIdPrefix2}/${vfolderIdRest.replaceAll('-', '')}`
    : '';

  return {
    quotaScopeType,
    quotaScopeIdWithoutType,
    vfolderId,
    vfolderIdPrefix1,
    vfolderIdPrefix2,
    vfolderIdRest,
    vfolderPath,
  };
};
