import { convertDecimalSizeUnit, toLocalId } from '../helper';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import UserUnionIcon from './BAIIcons/UserUnionIcon';
import BAITag from './BAITag';
import Flex from './Flex';
import { statusTagColor } from './VFolderNodes';
import VFolderPermissionCell from './VFolderPermissionCell';
import { VFolderNodeDescriptionFragment$key } from './__generated__/VFolderNodeDescriptionFragment.graphql';
import { CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import {
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
import { useFragment } from 'react-relay';

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
}

const VFolderNodeDescription: React.FC<VFolderNodeDescriptionProps> = ({
  vfolderNodeFrgmt,
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyle();

  const currentProject = useCurrentProjectValue();
  const userRole = useCurrentUserRole();
  const [currentUser] = useCurrentUserInfo();

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

  const items: DescriptionsProps['items'] = [
    {
      key: 'path',
      label: (
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
              <Typography.Text type="secondary">
                Quota scope ID ({_.split(vfolderNode?.quota_scope_id, ':')?.[0]}
                )
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
              <Typography.Text type="secondary">VFolder ID</Typography.Text>
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
    {
      key: 'permission',
      label: t('data.folders.Permission'),
      children: <VFolderPermissionCell vfolderFrgmt={vfolderNode} />,
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
    {
      key: 'user',
      label: t('data.User'),
      children: (
        <Typography.Text copyable={vfolderNode.user !== null}>
          {vfolderNode.user}
        </Typography.Text>
      ),
    },
    {
      key: 'group',
      label: t('data.Project'),
      children: (
        <Typography.Text copyable={vfolderNode.group !== null}>
          {vfolderNode.group}
        </Typography.Text>
      ),
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
  ];

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
