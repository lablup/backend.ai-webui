import { ControlItemsFragment$key } from '../../../__generated__/ControlItemsFragment.graphql';
import { ControlItems_AllowedVFolderHostsQuery } from '../../../__generated__/ControlItems_AllowedVFolderHostsQuery.graphql';
import { ControlItems_KeypairQuery } from '../../../__generated__/ControlItems_KeypairQuery.graphql';
import { ControlItems_UserInfoQuery } from '../../../__generated__/ControlItems_UserInfoQuery.graphql';
import { TrashBinIcon } from '../../../icons';
import Flex from '../../Flex';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import { FolderInfoContext } from './BAIFileExplorer';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { App, Button, theme } from 'antd';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import { useContext } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ControlItemsProps {
  ControlItemsFrgmt?: ControlItemsFragment$key | null;
  selectedItem: VFolderFile;
  onClickDelete: () => void;
}

const ControlItems: React.FC<ControlItemsProps> = ({
  ControlItemsFrgmt,
  selectedItem,
  onClickDelete,
}) => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { targetFolder } = useContext(FolderInfoContext);
  const baiClient = useConnectedBAIClient();
  const userId = baiClient.email;
  const currentDomainName = baiClient._config.domainName;
  const currentProjectId = baiClient.current_group_id();
  const { data: vhostInfo } = useSuspenseQuery({
    queryKey: ['vhostInfo'],
    queryFn: async () => {
      return await baiClient.vfolder.list_hosts();
    },
  });

  const currentVFolderHost = useFragment(
    graphql`
      fragment ControlItemsFragment on VirtualFolderNode {
        host @required(action: THROW)
      }
    `,
    ControlItemsFrgmt,
  );

  const { user } = useLazyLoadQuery<ControlItems_UserInfoQuery>(
    graphql`
      query ControlItems_UserInfoQuery($email: String!) {
        user(email: $email) @required(action: THROW) {
          main_access_key @required(action: THROW)
        }
      }
    `,
    {
      email: userId,
    },
    {
      fetchPolicy: 'network-only',
    },
  );

  const { keypair } = useLazyLoadQuery<ControlItems_KeypairQuery>(
    graphql`
      query ControlItems_KeypairQuery(
        $domainName: String!
        $accessKey: String
      ) {
        keypair(domain_name: $domainName, access_key: $accessKey)
          @required(action: THROW) {
          resource_policy @required(action: THROW)
        }
      }
    `,
    {
      domainName: currentDomainName,
      accessKey: user?.main_access_key,
    },
    {
      fetchPolicy: 'network-only',
    },
  );

  const mergedAllowedVFolderHosts =
    useLazyLoadQuery<ControlItems_AllowedVFolderHostsQuery>(
      graphql`
        query ControlItems_AllowedVFolderHostsQuery(
          $domainName: String
          $projectId: UUID!
          $resourcePolicyName: String
        ) {
          domain(name: $domainName) {
            allowed_vfolder_hosts
          }
          group(id: $projectId, domain_name: $domainName) {
            allowed_vfolder_hosts
          }
          keypair_resource_policy(name: $resourcePolicyName) {
            allowed_vfolder_hosts
          }
        }
      `,
      {
        domainName: currentDomainName,
        projectId: currentProjectId,
        resourcePolicyName: keypair?.resource_policy,
      },
      {
        fetchPolicy: 'network-only',
      },
    );

  const allowedPermissionForDomainsByVolume = JSON.parse(
    mergedAllowedVFolderHosts?.domain?.allowed_vfolder_hosts || '{}',
  );
  const allowedPermissionForGroupsByVolume = JSON.parse(
    mergedAllowedVFolderHosts?.group?.allowed_vfolder_hosts || '{}',
  );
  const allowedPermissionForResourcePolicyByVolume = JSON.parse(
    mergedAllowedVFolderHosts?.keypair_resource_policy?.allowed_vfolder_hosts ||
      '{}',
  );
  const unitedAllowedPermissionByVolume = Object.assign(
    {},
    ...vhostInfo.allowed.map((volume: string) => {
      return {
        [volume]: _mergeDedupe([
          allowedPermissionForDomainsByVolume[volume],
          allowedPermissionForGroupsByVolume[volume],
          allowedPermissionForResourcePolicyByVolume[volume],
        ]),
      };
    }),
  );

  const enableDownload = _.includes(
    unitedAllowedPermissionByVolume[currentVFolderHost?.host ?? ''],
    'download-file',
  );

  const downloadFileMutation = useMutation({
    mutationFn: async ({
      fileName,
      currentFolder,
      archive = false,
    }: {
      fileName: string;
      currentFolder: string;
      archive?: boolean;
    }): Promise<{ success: boolean; fileName: string }> => {
      try {
        const tokenResponse = await baiClient.vfolder.request_download_token(
          fileName,
          currentFolder,
          archive,
        );
        const downloadParams = new URLSearchParams({
          token: tokenResponse.token,
          archive: archive ? 'true' : 'false',
        });
        const downloadURL = `${tokenResponse.url}?${downloadParams.toString()}`;

        await initiateDownload(downloadURL, fileName);
        return { success: true, fileName };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: ({ fileName }) => {
      message.success(`파일 "${fileName}" 다운로드가 시작되었습니다.`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.title ||
        '파일 다운로드 중 오류가 발생했습니다.';
      message.error(errorMessage);
    },
  });

  const handleDownload = () => {
    if (!selectedItem || downloadFileMutation.isPending) return;

    downloadFileMutation.mutate({
      fileName: selectedItem.name,
      currentFolder: targetFolder,
      archive: selectedItem.type === 'DIRECTORY',
    });
  };

  return (
    <Flex gap="xs">
      <Button
        type="text"
        size="small"
        icon={<DownloadIcon color={token.colorInfo} />}
        disabled={!enableDownload || downloadFileMutation.isPending}
        loading={downloadFileMutation.isPending}
        onClick={handleDownload}
      />
      <Button
        type="text"
        size="small"
        icon={<TrashBinIcon style={{ color: token.colorError }} />}
        onClick={onClickDelete}
      />
    </Flex>
  );
};

export default ControlItems;

const _mergeDedupe = (arr: any[]) => [
  ...new Set([].concat(...arr.filter(Boolean))),
];

/**
 *
 * @param downloadURL
 * @param fileName
 */
const initiateDownload = async (
  downloadURL: string,
  fileName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore - iOS Safari
      if (globalThis.iOSSafari) {
        const newWindow = window.open(downloadURL, '_blank');
        if (!newWindow) {
          throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        }
        resolve();
      } else {
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = downloadURL;
        downloadLink.download = fileName;
        downloadLink.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};
