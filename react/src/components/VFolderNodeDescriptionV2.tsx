/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. antd `Descriptions bordered size="small"`
 becomes `MetadataList columns="single"` (MAPPING §4: `bordered`/`size` have
 no destination and are DROPPED, defaults-first). The status tag routes
 through the repo-global ticket-13 lookup and copyable values use
 `BAIText copyable`. The mount permission is edited from the share modal
 (#10647), not here.
*/
import { VFolderNodeDescriptionV2Fragment$key } from '../__generated__/VFolderNodeDescriptionV2Fragment.graphql';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useVirtualFolderPathV2 } from '../hooks/useVirtualFolderNodePathV2';
import { formatBinarySizeInfo } from './VFolderNodesV2';
import VFolderPermissionCellV2 from './VFolderPermissionCellV2';
import VirtualFolderPathV2 from './VirtualFolderNodeItems/VirtualFolderPathV2';
import { Badge } from '@lablup/ui-common/Badge';
import { HStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIMetadataList,
  BAIMetadataListItem,
  filterOutEmpty,
  badgeVariantForStatus,
  BAIText,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import {
  CircleCheckIcon,
  CircleXIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface VFolderNodeDescriptionV2Props {
  vfolderNodeFrgmt: VFolderNodeDescriptionV2Fragment$key;
}

const VFolderNodeDescriptionV2: React.FC<VFolderNodeDescriptionV2Props> = ({
  vfolderNodeFrgmt,
  ...props
}) => {
  'use memo';
  const { t } = useTranslation();
  const [currentUser] = useCurrentUserInfo();
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
          ownershipType
        }
        quota {
          maxFiles
          maxSize {
            expr @since(version: "26.8.0")
          }
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
          # Readable folder, unreadable owning project (a share recipient):
          # null here, named "Unknown project" below (#10647).
          project @catch(to: NULL) {
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

  const items = filterOutEmpty([
    !vfolderNode?.unmanagedPath && {
      key: 'path',
      label: (
        <BAIText copyable={{ text: vfolderPath }}>
          {t('data.folders.Path')}
        </BAIText>
      ),
      children: <VirtualFolderPathV2 vfolderNodeFrgmt={vfolderNode} />,
    },
    {
      key: 'status',
      label: t('data.folders.Status'),
      children: (
        <Badge
          variant={badgeVariantForStatus('vfolder', vfolderNode.status)}
          label={_.toUpper(vfolderNode.status ?? '')}
        />
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
          <HStack gap={2}>
            <Text>{t('data.User')}</Text>
            <UserIcon size="1em" />
          </HStack>
        ) : (
          <HStack gap={2}>
            <Text>{t('data.Project')}</Text>
            <UsersIcon size="1em" />
          </HStack>
        ),
    },
    // The owner always mounts read & write, so the row is for everyone else,
    // showing the same server-computed level as the folder list (#10647).
    vfolderNode.ownership?.userId !== currentUser?.uuid && {
      key: 'mount_permission',
      label: t('data.folders.MountPermission'),
      children: <VFolderPermissionCellV2 vfolderFrgmt={vfolderNode} />,
    },
    {
      key: 'owner',
      label: t('data.folders.Owner'),
      children: (
        <HStack justify="start">
          {vfolderNode?.ownership?.creatorId === currentUser?.uuid ? (
            <CircleCheckIcon size="1em" />
          ) : (
            <CircleXIcon size="1em" />
          )}
        </HStack>
      ),
    },
    vfolderNode.ownership?.user?.basicInfo?.email && {
      key: 'user_email',
      label: t('data.User'),
      children: (
        <BAIText copyable>
          {vfolderNode.ownership?.user?.basicInfo?.email ?? ''}
        </BAIText>
      ),
    },
    vfolderNode.ownership?.projectId && {
      key: 'group_name',
      label: t('data.Project'),
      children:
        vfolderNode.ownership.project?.basicInfo?.name ??
        t('data.folders.UnknownProject'),
    },
    {
      key: 'cloneable',
      label: t('data.folders.Cloneable'),
      children: (
        <HStack justify="start">
          {vfolderNode.metadata?.cloneable ? (
            <CircleCheckIcon size="1em" />
          ) : (
            <CircleXIcon size="1em" />
          )}
        </HStack>
      ),
    },
    // A null `maxSize` / a zero `maxFiles` is "no limit".
    {
      key: 'max_size',
      label: t('data.folders.MaxSize'),
      children: formatBinarySizeInfo(vfolderNode.quota.maxSize) ?? '∞',
    },
    {
      key: 'max_files',
      label: t('data.folders.MaxFiles'),
      children: vfolderNode.quota.maxFiles
        ? vfolderNode.quota.maxFiles.toLocaleString()
        : '∞',
    },
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
    <BAIMetadataList columns="single" {...props}>
      {items.map((item) => (
        <BAIMetadataListItem key={item.key} label={item.label}>
          {item.children}
        </BAIMetadataListItem>
      ))}
    </BAIMetadataList>
  );
};

export default VFolderNodeDescriptionV2;
