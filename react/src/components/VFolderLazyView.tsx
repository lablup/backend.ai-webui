import { useBaiSignedRequestWithPromise } from '../helper';
import { useWebUINavigate } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { VFolder } from './VFolderSelect';
import { FolderOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import React from 'react';

interface VFolderLazyViewProps {
  uuid: string;
  mountDestination?: string | null;
  clickable?: boolean;
}
const VFolderLazyView: React.FC<VFolderLazyViewProps> = ({
  uuid,
  mountDestination,
  clickable,
}) => {
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const webuiNavigate = useWebUINavigate();
  const { data: vFolders } = useTanQuery({
    queryKey: ['VFolderSelectQuery'],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?group_id=${currentProject.id}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 1000,
    suspense: true,
  });

  const vFolder = vFolders?.find(
    // `id` of `/folders` API is not UUID, but UUID without `-`
    (vFolder) => vFolder.id === uuid.replaceAll('-', ''),
  );

  return (
    vFolder &&
    (clickable ? (
      <Typography.Link
        onClick={() => {
          webuiNavigate({
            pathname: '/data',
            search: `?folder=${vFolder.name}`,
          });
        }}
      >
        <FolderOutlined /> {`${vFolder.name}/${mountDestination}`}
      </Typography.Link>
    ) : (
      <div>
        <FolderOutlined /> {`${vFolder.name}/${mountDestination}`}
      </div>
    ))
  );
};

export default VFolderLazyView;
