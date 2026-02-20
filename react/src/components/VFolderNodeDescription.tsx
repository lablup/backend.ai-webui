/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeDescriptionFragment$key } from '../__generated__/VFolderNodeDescriptionFragment.graphql';
import { VFolderNodeDescriptionPermissionRefreshQuery } from '../__generated__/VFolderNodeDescriptionPermissionRefreshQuery.graphql';
import { useVirtualFolderNodePathFragment$key } from '../__generated__/useVirtualFolderNodePathFragment.graphql';
import { convertToDecimalUnit } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVirtualFolderPath } from '../hooks/useVirtualFolderNodePath';
import { statusTagColor } from './VFolderNodes';
import VirtualFolderPath from './VirtualFolderNodeItems/VirtualFolderPath';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
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
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

interface VFolderNodeDescriptionProps extends DescriptionsProps {
  vfolderNodeFrgmt: VFolderNodeDescriptionFragment$key;
}

const VFolderNodeDescription: React.FC<VFolderNodeDescriptionProps> = ({
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

  const updateMutation = useTanMutation({
    mutationFn: ({ permission, id }: { permission: string; id: string }) => {
      return baiClient.vfolder.update_folder({ permission }, id);
    },
  });

  const vfolderNode = useFragment(
    graphql`
      fragment VFolderNodeDescriptionFragment on VirtualFolderNode {
        id
        host
        quota_scope_id
        user
        user_email
        group
        group_name
        creator
        usage_mode
        permission
        ownership_type
        max_files
        max_size
        created_at
        last_used
        num_files
        cur_size
        cloneable
        status
        permissions @since(version: "24.09.0")
        unmanaged_path @since(version: "25.04.0")
        ...VFolderPermissionCellFragment
        ...useVirtualFolderNodePathFragment
      }
    `,
    vfolderNodeFrgmt,
  );

  const { vfolderPath } = useVirtualFolderPath(
    // Temporary type assertion to suppress TS error – not actually needed at runtime
    vfolderNode as useVirtualFolderNodePathFragment$key,
  );

  const vfolderId = toLocalId(vfolderNode.id);

  const items: DescriptionsProps['items'] = filterOutEmpty([
    !vfolderNode?.unmanaged_path && {
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
      children: <VirtualFolderPath vfolderNodeFrgmt={vfolderNode} />,
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
          {_.toUpper(vfolderNode.status || '')}
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
        vfolderNode?.ownership_type === 'user' ? (
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
    (vfolderNode?.user === currentUser.uuid ||
      (baiClient.is_admin && vfolderNode?.group === currentProject?.id)) && {
      key: 'permission',
      label: t('data.folders.MountPermission'),
      children: (
        <BAISelect
          defaultValue={
            vfolderNode.permission === 'wd' ? 'rw' : vfolderNode.permission
          }
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

                  // To update GraphQL relay node
                  fetchQuery<VFolderNodeDescriptionPermissionRefreshQuery>(
                    relayEnv,
                    graphql`
                      query VFolderNodeDescriptionPermissionRefreshQuery(
                        $id: String!
                      ) {
                        vfolder_node(id: $id) {
                          permission
                          permissions
                        }
                      }
                    `,
                    {
                      id: vfolderNode.id,
                    },
                  ).toPromise();
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
      children:
        vfolderNode?.user === currentUser?.uuid ||
        (baiClient.is_admin && vfolderNode?.group === currentProject?.id) ? (
          <BAIFlex justify="start">
            <CheckCircleOutlined />
          </BAIFlex>
        ) : null,
    },
    vfolderNode.user_email !== null && {
      key: 'user_email',
      label: t('data.User'),
      children: (
        <Typography.Text copyable>{vfolderNode.user_email}</Typography.Text>
      ),
    },
    vfolderNode.group_name !== null && {
      key: 'group_name',
      label: t('data.Project'),
      children: vfolderNode.group_name,
    },
    {
      key: 'cloneable',
      label: t('data.folders.Cloneable'),
      children: vfolderNode.cloneable ? (
        <BAIFlex justify="start">
          <CheckCircleOutlined />
        </BAIFlex>
      ) : null,
    },
    {
      key: 'max_size',
      label: t('data.folders.MaxSize'),
      children: vfolderNode.max_size
        ? convertToDecimalUnit(vfolderNode.max_size, 'g', 2)?.displayValue
        : '∞',
    },
    {
      key: 'usage',
      label: t('data.UsageMode'),
      children: vfolderNode.usage_mode,
    },
    {
      key: 'created_at',
      label: t('data.folders.CreatedAt'),
      children: dayjs(vfolderNode.created_at).format('lll'),
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

export default VFolderNodeDescription;
