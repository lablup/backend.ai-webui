import { useBaiSignedRequestWithPromise } from '../helper';
import { useWebUINavigate } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { VFolder } from './VFolderSelect';
import { FolderOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import React from 'react';

interface VFolderLazyViewProps {
  uuid: string;
  clickable?: boolean;
}
const VFolderLazyView: React.FC<VFolderLazyViewProps> = ({
  uuid,
  clickable,
}) => {
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();

  const webuiNavigate = useWebUINavigate();
  const { data: vFolders } = useSuspenseTanQuery({
    queryKey: ['VFolderSelectQuery'],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?${search.toString()}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 1000,
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
            search: `?folder=${vFolder.id}`,
          });
        }}
      >
        <FolderOutlined /> {vFolder.name}
      </Typography.Link>
    ) : (
      <div>
        <FolderOutlined /> {vFolder.name}
      </div>
    ))
  );
};

export default VFolderLazyView;
