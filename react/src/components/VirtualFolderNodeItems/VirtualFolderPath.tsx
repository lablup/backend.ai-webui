import { useVirtualFolderNodePathFragment$key } from '../../__generated__/useVirtualFolderNodePathFragment.graphql';
import { useVirtualFolderPath } from '../../hooks/useVirtualFolderNodePath';
import BAIText from '../BAIText';
import { theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';

interface VirtualFolderPathProps {
  vfolderNodeFrgmt: useVirtualFolderNodePathFragment$key;
}

const VirtualFolderPath: React.FC<VirtualFolderPathProps> = ({
  vfolderNodeFrgmt,
}) => {
  const {
    quotaScopeType,
    quotaScopeIdWithoutType,
    vfolderId,
    vfolderIdPrefix1,
    vfolderIdPrefix2,
    vfolderIdRest,
  } = useVirtualFolderPath(vfolderNodeFrgmt);

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
          {_.truncate(quotaScopeIdWithoutType, { length: 15 })}
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
            {_.truncate(vfolderIdRest.join(''), { length: 7 })}
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

export default VirtualFolderPath;
