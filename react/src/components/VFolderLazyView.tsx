import { useWebUINavigate } from '../hooks';
import VFolderNodeIdenticon from './VFolderNodeIdenticon';
import { Typography } from 'antd';
import { BAIFlex, toLocalId } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';
import { VFolderLazyViewQuery } from 'src/__generated__/VFolderLazyViewQuery.graphql';

interface VFolderLazyViewProps {
  uuid: string;
  clickable?: boolean;
}
const VFolderLazyView: React.FC<VFolderLazyViewProps> = ({
  uuid,
  clickable,
}) => {
  const location = useLocation();

  const webuiNavigate = useWebUINavigate();

  const { vfolder_node } = useLazyLoadQuery<VFolderLazyViewQuery>(
    graphql`
      query VFolderLazyViewQuery($id: String!) {
        vfolder_node(id: $id) {
          id @required(action: THROW)
          name
          ...VFolderNodeIdenticonFragment
        }
      }
    `,
    { id: uuid },
  );

  return (
    <>
      {vfolder_node && (
        <BAIFlex align="center" gap="xs">
          <VFolderNodeIdenticon vfolderNodeIdenticonFrgmt={vfolder_node} />
          {clickable ? (
            <Typography.Link
              onClick={() => {
                webuiNavigate({
                  pathname: location.pathname,
                  search: new URLSearchParams({
                    folder: toLocalId(vfolder_node.id),
                  }).toString(),
                });
              }}
            >
              {vfolder_node.name}
            </Typography.Link>
          ) : (
            <Typography.Text>{vfolder_node.name}</Typography.Text>
          )}
        </BAIFlex>
      )}
    </>
  );
};

export default VFolderLazyView;
