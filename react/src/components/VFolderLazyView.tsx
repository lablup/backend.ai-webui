import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
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

  const { moveTo } = useWebComponentInfo();
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
          moveTo('/data', { folder: vFolder.name });
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
