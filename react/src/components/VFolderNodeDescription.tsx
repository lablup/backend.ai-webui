import { convertDecimalSizeUnit, filterEmptyItem, toLocalId } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { usePainKiller } from '../hooks/usePainKiller';
import UserUnionIcon from './BAIIcons/UserUnionIcon';
import BAISelect from './BAISelect';
import BAITag from './BAITag';
import Flex from './Flex';
import { statusTagColor } from './VFolderNodes';
import { VFolderNodeDescriptionFragment$key } from './__generated__/VFolderNodeDescriptionFragment.graphql';
import { VFolderNodeDescriptionPermissionRefreshQuery } from './__generated__/VFolderNodeDescriptionPermissionRefreshQuery.graphql';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import {
  App,
  Descriptions,
  theme,
  Tooltip,
  Typography,
  type DescriptionsProps,
} from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { fetchQuery, useFragment, useRelayEnvironment } from 'react-relay';

const useStyle = createStyles(({ css }) => {
  return {
    path: css`
      width: fit-content;
      max-width: none;
      @media (max-width: 280px) {
        max-width: 150px;
      }
    `,
  };
});

interface VFolderNodeDescriptionProps extends DescriptionsProps {
  vfolderNodeFrgmt?: VFolderNodeDescriptionFragment$key | null;
  onRequestRefresh?: () => void;
}

const VFolderNodeDescription: React.FC<VFolderNodeDescriptionProps> = ({
  vfolderNodeFrgmt,
  onRequestRefresh,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyle();
  const { message } = App.useApp();

  const relayEnv = useRelayEnvironment();
  const currentProject = useCurrentProjectValue();
  const userRole = useCurrentUserRole();
  const painKiller = usePainKiller();
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
        ...VFolderPermissionCellFragment
      }
    `,
    vfolderNodeFrgmt,
  );

  if (!vfolderNode) {
    return null;
  }

  const quotaScopeId = _.split(vfolderNode?.quota_scope_id, ':')?.[1];
  const vfolderId = toLocalId(vfolderNode?.id);
  const [vfolderIdPrefix1, vfolderIdPrefix2, ...vfolderIdRest] = [
    vfolderId.slice(0, 2),
    vfolderId.slice(2, 4),
    vfolderId.slice(4),
  ];

  const items: DescriptionsProps['items'] = filterEmptyItem([
    {
      key: 'path',
      label: (
        <Tooltip
          title={`${quotaScopeId}/${vfolderIdPrefix1}/${vfolderIdPrefix2}/${vfolderIdRest}`}
        >
          <Typography.Text
            copyable={{
              text: `${quotaScopeId}/${vfolderIdPrefix1}/${vfolderIdPrefix2}/${vfolderIdRest}`,
            }}
            style={{
              color: token.colorTextLabel,
            }}
          >
            {t('data.folders.Path')}
          </Typography.Text>
        </Tooltip>
      ),
      children: (
        <Flex align="start" gap={'xxs'} wrap="wrap">
          <Typography.Text type="secondary">(root) /</Typography.Text>
          <Tooltip title={quotaScopeId}>
            <Flex
              direction="column"
              align="start"
              wrap="wrap"
              className={styles.path}
            >
              <Typography.Text
                copyable={{
                  text: quotaScopeId,
                }}
                ellipsis
              >
                {quotaScopeId}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                Quota Scope ID (
                {_.upperFirst(_.split(vfolderNode?.quota_scope_id, ':')?.[0])})
              </Typography.Text>
            </Flex>
          </Tooltip>
          <Typography.Text type="secondary">/</Typography.Text>
          <Tooltip title={vfolderId}>
            <Flex
              direction="column"
              align="start"
              wrap="wrap"
              className={styles.path}
            >
              <Flex gap="xxs">
                <Typography.Text>{vfolderIdPrefix1}</Typography.Text>
                <Typography.Text type="secondary">/</Typography.Text>
                <Typography.Text>{vfolderIdPrefix2}</Typography.Text>
                <Typography.Text type="secondary">/</Typography.Text>
                <Typography.Text
                  copyable={{
                    text: vfolderId,
                  }}
                  ellipsis
                >
                  {vfolderIdRest}
                </Typography.Text>
              </Flex>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                VFolder ID
              </Typography.Text>
            </Flex>
          </Tooltip>
        </Flex>
      ),
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
          <Flex gap={'xs'}>
            <Typography.Text>{t('data.User')}</Typography.Text>
            <UserOutlined style={{ color: token.colorTextTertiary }} />
          </Flex>
        ) : (
          <Flex gap={'xs'}>
            <Typography.Text>{t('data.Project')}</Typography.Text>
            <UserUnionIcon style={{ color: token.colorTextTertiary }} />
          </Flex>
        ),
    },
    vfolderNode?.user === currentUser.uuid && {
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
                  onRequestRefresh?.();
                },
                onError: (error: { message: string }) => {
                  message.error(painKiller.relieve(error?.message));
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
        (vfolderNode?.group === currentProject?.id && userRole === 'admin') ? (
          <Flex justify="start">
            <CheckCircleOutlined />
          </Flex>
        ) : null,
    },
    vfolderNode.user !== null && {
      key: 'user',
      label: t('data.User'),
      children: <Typography.Text copyable>{vfolderNode.user}</Typography.Text>,
    },
    vfolderNode.group !== null && {
      key: 'group',
      label: t('data.Project'),
      children: <Typography.Text copyable>{vfolderNode.group}</Typography.Text>,
    },
    {
      key: 'cloneable',
      label: t('data.folders.Cloneable'),
      children: vfolderNode.cloneable ? (
        <Flex justify="start">
          <CheckCircleOutlined />
        </Flex>
      ) : null,
    },
    {
      key: 'max_size',
      label: t('data.folders.MaxSize'),
      children: vfolderNode.max_size
        ? `${convertDecimalSizeUnit(vfolderNode.max_size, 'g', 2)?.numberUnit}B`
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
