/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. `BAIText monospace` becomes
 `Text type="code"`; the copyable segments render `BAIText code copyable`
 (truncated display, full-value copy via `copyable.text`).
*/
import { useVirtualFolderNodePathV2Fragment$key } from '../../__generated__/useVirtualFolderNodePathV2Fragment.graphql';
import { useVirtualFolderPathV2 } from '../../hooks/useVirtualFolderNodePathV2';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BAIText } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';

interface VirtualFolderPathV2Props {
  vfolderNodeFrgmt: useVirtualFolderNodePathV2Fragment$key;
}

const VirtualFolderPathV2: React.FC<VirtualFolderPathV2Props> = ({
  vfolderNodeFrgmt,
}) => {
  'use memo';
  const {
    quotaScopeType,
    quotaScopeIdWithoutType,
    vfolderId,
    vfolderIdPrefix1,
    vfolderIdPrefix2,
    vfolderIdRest,
  } = useVirtualFolderPathV2(vfolderNodeFrgmt);

  return (
    <HStack align="start" justify="start" wrap="wrap" gap={3}>
      <Text type="code" color="secondary">
        (root)
      </Text>
      <Text type="code" color="secondary">
        /
      </Text>
      <VStack align="start" justify="start">
        <BAIText code copyable={{ text: quotaScopeIdWithoutType }}>
          {_.truncate(quotaScopeIdWithoutType.replaceAll('-', ''), {
            length: 15,
          })}
        </BAIText>
        <Text type="supporting">
          Quota Scope ID ({_.upperFirst(quotaScopeType)})
        </Text>
      </VStack>
      <Text type="code" color="secondary">
        /
      </Text>
      <VStack align="start" justify="start">
        <HStack gap={3}>
          <Text type="code">{vfolderIdPrefix1}</Text>
          <Text type="code" color="secondary">
            /
          </Text>
          <Text type="code">{vfolderIdPrefix2}</Text>
          <Text type="code" color="secondary">
            /
          </Text>
          <BAIText code copyable={{ text: vfolderId }}>
            {_.truncate(vfolderIdRest.replaceAll('-', ''), { length: 7 })}
          </BAIText>
        </HStack>
        <Text type="supporting">VFolder ID</Text>
      </VStack>
    </HStack>
  );
};

export default VirtualFolderPathV2;
