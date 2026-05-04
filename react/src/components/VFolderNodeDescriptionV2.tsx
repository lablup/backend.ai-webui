/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeDescriptionV2Fragment$key } from '../__generated__/VFolderNodeDescriptionV2Fragment.graphql';
import { VFolderNodeDescriptionV2PermissionRefreshQuery } from '../__generated__/VFolderNodeDescriptionV2PermissionRefreshQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import { useVirtualFolderPathV2 } from '../hooks/useVirtualFolderNodePathV2';
import { statusTagColor } from './VFolderNodesV2';
import VirtualFolderPathV2 from './VirtualFolderNodeItems/VirtualFolderPathV2';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  App,
  Descriptions,
  theme,
  Typography,
  type DescriptionsProps,
} from 'antd';
import {
  filterOutEmpty,
  BAIUserUnionIcon,
  toLocalId,
  BAIFlex,
  useErrorMessageResolver,
  BAISelect,
  BAITag,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

interface VFolderNodeDescriptionV2Props extends DescriptionsProps {
  vfolderNodeFrgmt: VFolderNodeDescriptionV2Fragment$key;
}

const VFolderNodeDescriptionV2: React.FC<VFolderNodeDescriptionV2Props> = ({
  vfolderNodeFrgmt,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const relayEnv = useRelayEnvironment();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const [currentUser] = useCurrentUserInfo();
  const effectiveAdminRole = useEffectiveAdminRole();

  // TODO(needs-backend): the mount-permission update still goes through the
  // legacy REST endpoint (`baiClient.vfolder.update_folder`) because the V2
  // GraphQL schema does not yet expose a corresponding mutation. Replace this
  // with a V2 mutation once the backend provides one — see FR-2619 follow-up.
  const updateMutation = useTanMutation({
    mutationFn: ({ permission, id }: { permission: string; id: string }) => {
      return baiClient.vfolder.update_folder({ permission }, id);
    },
  });

  const vfolderNode = useFragment(
    graphql`
      fragment VFolderNodeDescriptionV2Fragment on VFolder {
        id
        host
        status
        unmanagedPath
        metadata {
          name
          usageMode
          cloneable
          createdAt
        }
        accessControl {
          permission
          ownershipType
        }
        ownership {
          userId
          projectId
          creatorId
          user {
            basicInfo {
              email
            }
          }
          project {
            basicInfo {
              name
            }
          }
        }
        ...VFolderPermissionCellV2Fragment
        ...useVirtualFolderNodePathV2Fragment
      }
    `,
    vfolderNodeFrgmt,
  );

  const { vfolderPath } = useVirtualFolderPathV2(vfolderNode);

  const vfolderId = toLocalId(vfolderNode.id);

  // V2 `VFolderMountPermission` enum → legacy REST permission string mapping
  // for the `<BAISelect/>` below. READ_ONLY → 'ro', READ_WRITE/RW_DELETE → 'rw'.
  // NOTE: `accessControl.permission` is the *mount* permission (how this folder
  // would be mounted into a session), not the caller's operational rights on
  // the folder. When the value is null/undefined we fall back to 'ro' so that
  // users without an explicit permission do not see a misleading read-write
  // default. See FR-2619 follow-up for a proper permission set.
  const currentSelectPermission =
    vfolderNode.accessControl?.permission === 'READ_WRITE' ||
    vfolderNode.accessControl?.permission === 'RW_DELETE'
      ? 'rw'
      : 'ro';

  const items: DescriptionsProps['items'] = filterOutEmpty([
    !vfolderNode?.unmanagedPath && {
      key: 'path',
      label: (
        <Typography.Text
          copyable={{
            text: vfolderPath,
          }}
          style={{
            color: token.colorTextLabel,
          }}
        >
          {t('data.folders.Path')}
        </Typography.Text>
      ),
      children: <VirtualFolderPathV2 vfolderNodeFrgmt={vfolderNode} />,
    },
    {
      key: 'status',
      label: t('data.folders.Status'),
      children: (
        <BAITag
          color={
            vfolderNode.status
              ? statusTagColor[
                  vfolderNode.status as keyof typeof statusTagColor
                ]
              : undefined
          }
        >
          {_.toUpper(vfolderNode.status ?? '')}
        </BAITag>
      ),
    },
    {
      key: 'host',
      label: t('data.Host'),
      children: vfolderNode.host,
    },
    {
      key: 'ownership_type',
      label: t('data.folders.Ownership'),
      children:
        vfolderNode?.accessControl?.ownershipType === 'USER' ? (
          <BAIFlex gap={'xs'}>
            <Typography.Text>{t('data.User')}</Typography.Text>
            <UserOutlined style={{ color: token.colorTextTertiary }} />
          </BAIFlex>
        ) : (
          <BAIFlex gap={'xs'}>
            <Typography.Text>{t('data.Project')}</Typography.Text>
            <BAIUserUnionIcon style={{ color: token.colorTextTertiary }} />
          </BAIFlex>
        ),
    },
    // Mount permission editing is allowed for the folder owner, super admins
    // (any project), or the current project's admin when the folder belongs to
    // that project. Domain admins are intentionally excluded — they do not
    // have implicit per-project ownership rights.
    (vfolderNode?.ownership?.userId === currentUser.uuid ||
      effectiveAdminRole === 'superadmin' ||
      (effectiveAdminRole === 'currentProjectAdmin' &&
        vfolderNode?.ownership?.projectId === currentProject?.id)) && {
      key: 'permission',
      label: t('data.folders.MountPermission'),
      children: (
        <BAISelect
          defaultValue={currentSelectPermission}
          options={[
            { value: 'ro', label: t('data.ReadOnly') },
            { value: 'rw', label: t('data.ReadWrite') },
          ]}
          onChange={(value) => {
            updateMutation.mutate(
              { permission: value, id: vfolderId },
              {
                onSuccess: () => {
                  message.success(t('data.permission.PermissionModified'));
                  document.dispatchEvent(
                    new CustomEvent('backend-ai-folder-updated'),
                  );

                  // Refresh the V2 VFolder record so the UI reflects the new
                  // `accessControl.permission` value. The refetch is fire-and-
                  // forget; swallow failures so a background refresh error
                  // does not surface as an unhandled promise rejection.
                  void fetchQuery<VFolderNodeDescriptionV2PermissionRefreshQuery>(
                    relayEnv,
                    graphql`
                      query VFolderNodeDescriptionV2PermissionRefreshQuery(
                        $vfolderId: UUID!
                      ) {
                        vfolderV2(vfolderId: $vfolderId) {
                          id
                          accessControl {
                            permission
                          }
                        }
                      }
                    `,
                    {
                      vfolderId,
                    },
                  )
                    .toPromise()
                    .catch(() => {});
                },
                onError: (error) => {
                  message.error(getErrorMessage(error));
                },
              },
            );
          }}
          popupMatchSelectWidth={false}
        />
      ),
    },
    {
      key: 'owner',
      label: t('data.folders.Owner'),
      children: (
        <BAIFlex justify="start">
          {vfolderNode?.ownership?.creatorId === currentUser?.uuid ? (
            <CheckCircleOutlined />
          ) : (
            <CloseCircleOutlined />
          )}
        </BAIFlex>
      ),
    },
    vfolderNode.ownership?.user?.basicInfo?.email && {
      key: 'user_email',
      label: t('data.User'),
      children: (
        <Typography.Text copyable>
          {vfolderNode.ownership?.user?.basicInfo?.email}
        </Typography.Text>
      ),
    },
    vfolderNode.ownership?.project?.basicInfo?.name && {
      key: 'group_name',
      label: t('data.Project'),
      children: vfolderNode.ownership?.project?.basicInfo?.name,
    },
    {
      key: 'cloneable',
      label: t('data.folders.Cloneable'),
      children: (
        <BAIFlex justify="start">
          {vfolderNode.metadata?.cloneable ? (
            <CheckCircleOutlined />
          ) : (
            <CloseCircleOutlined />
          )}
        </BAIFlex>
      ),
    },
    // TODO(needs-backend): V2 `VFolder` does not yet expose quota limits
    // (`max_size`, `max_files`). Hide the MaxSize row until the backend
    // catches up — see FR-2573 follow-up.
    {
      key: 'usage',
      label: t('data.UsageMode'),
      children: (() => {
        switch (vfolderNode.metadata?.usageMode) {
          case 'GENERAL':
            return t('data.General');
          case 'DATA':
            return t('webui.menu.Data');
          case 'MODEL':
            return t('data.Models');
          default:
            return vfolderNode.metadata?.usageMode;
        }
      })(),
    },
    {
      key: 'created_at',
      label: t('data.folders.CreatedAt'),
      children: vfolderNode.metadata?.createdAt
        ? dayjs(vfolderNode.metadata.createdAt).format('lll')
        : '-',
    },
  ]);

  return (
    <Descriptions
      bordered
      column={1}
      size="small"
      items={items}
      styles={{
        content: {
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
      }}
      {...props}
    />
  );
};

export default VFolderNodeDescriptionV2;
