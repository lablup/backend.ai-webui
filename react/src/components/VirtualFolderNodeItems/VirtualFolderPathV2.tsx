/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useVirtualFolderNodePathV2Fragment$key } from '../../__generated__/useVirtualFolderNodePathV2Fragment.graphql';
import { useVirtualFolderPathV2 } from '../../hooks/useVirtualFolderNodePathV2';
import { theme } from 'antd';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';

interface VirtualFolderPathV2Props {
  vfolderNodeFrgmt: useVirtualFolderNodePathV2Fragment$key;
}

const VirtualFolderPathV2: React.FC<VirtualFolderPathV2Props> = ({
  vfolderNodeFrgmt,
}) => {
  const {
    quotaScopeType,
    quotaScopeIdWithoutType,
    vfolderId,
    vfolderIdPrefix1,
    vfolderIdPrefix2,
    vfolderIdRest,
  } = useVirtualFolderPathV2(vfolderNodeFrgmt);

  const { token } = theme.useToken();

  return (
    <BAIFlex direction="row" align="start" justify="start" wrap="wrap" gap={3}>
      <BAIText monospace type="secondary" style={{ fontSize: '0.9em' }}>
        (root)
      </BAIText>
      <BAIText monospace type="secondary" style={{ fontSize: '0.9em' }}>
        /
      </BAIText>
      <BAIFlex direction="column" align="start" justify="start">
        <BAIText
          monospace
          copyable={{
            text: quotaScopeIdWithoutType,
          }}
          style={{ fontSize: '0.9em' }}
        >
          {_.truncate(quotaScopeIdWithoutType.replaceAll('-', ''), {
            length: 15,
          })}
        </BAIText>
        <BAIText
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
          }}
        >
          Quota Scope ID ({_.upperFirst(quotaScopeType)})
        </BAIText>
      </BAIFlex>
      <BAIText monospace type="secondary" style={{ fontSize: '0.9em' }}>
        /
      </BAIText>
      <BAIFlex direction="column" align="start" justify="start">
        <BAIFlex gap={3}>
          <BAIText monospace style={{ fontSize: '0.9em' }}>
            {vfolderIdPrefix1}
          </BAIText>
          <BAIText monospace type="secondary" style={{ fontSize: '0.9em' }}>
            /
          </BAIText>
          <BAIText monospace style={{ fontSize: '0.9em' }}>
            {vfolderIdPrefix2}
          </BAIText>
          <BAIText monospace type="secondary" style={{ fontSize: '0.9em' }}>
            /
          </BAIText>
          <BAIText
            monospace
            copyable={{
              text: vfolderId,
            }}
            style={{ fontSize: '0.9em' }}
          >
            {_.truncate(vfolderIdRest.replaceAll('-', ''), { length: 7 })}
          </BAIText>
        </BAIFlex>
        <BAIText
          type="secondary"
          style={{
            fontSize: token.fontSizeSM,
          }}
        >
          VFolder ID
        </BAIText>
      </BAIFlex>
    </BAIFlex>
  );
};

export default VirtualFolderPathV2;
