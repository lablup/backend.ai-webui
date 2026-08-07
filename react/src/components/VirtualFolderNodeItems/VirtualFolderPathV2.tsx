/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. `BAIText monospace` becomes
 `Text type="code"`; `copyable={{ text }}` (truncated display, full-value
 copy) becomes `BAICopyableText copyText` (astryx-bui gap component).
*/
import { useVirtualFolderNodePathV2Fragment$key } from '../../__generated__/useVirtualFolderNodePathV2Fragment.graphql';
import { useVirtualFolderPathV2 } from '../../hooks/useVirtualFolderNodePathV2';
import BAICopyableText from '../astryx-bui/BAICopyableText';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
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
        <BAICopyableText type="code" copyText={quotaScopeIdWithoutType}>
          {_.truncate(quotaScopeIdWithoutType.replaceAll('-', ''), {
            length: 15,
          })}
        </BAICopyableText>
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
          <BAICopyableText type="code" copyText={vfolderId}>
            {_.truncate(vfolderIdRest.replaceAll('-', ''), { length: 7 })}
          </BAICopyableText>
        </HStack>
        <Text type="supporting">VFolder ID</Text>
      </VStack>
    </HStack>
  );
};

export default VirtualFolderPathV2;
