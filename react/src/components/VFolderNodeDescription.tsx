/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderNodeDescriptionFragment$key } from '../__generated__/VFolderNodeDescriptionFragment.graphql';
import { VFolderNodeDescriptionPermissionRefreshQuery } from '../__generated__/VFolderNodeDescriptionPermissionRefreshQuery.graphql';
import { useVirtualFolderNodePathFragment$key } from '../__generated__/useVirtualFolderNodePathFragment.graphql';
import { App } from '../app-shim';
import { convertToDecimalUnit } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVirtualFolderPath } from '../hooks/useVirtualFolderNodePath';
import VirtualFolderPath from './VirtualFolderNodeItems/VirtualFolderPath';
import { Badge } from '@astryxdesign/core/Badge';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Selector } from '@astryxdesign/core/Selector';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  filterOutEmpty,
  BAIUserUnionIcon,
  toLocalId,
  BAIFlex,
  useErrorMessageResolver,
  badgeVariantForStatus,
  BAIText,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { CircleCheck, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  fetchQuery,
  useFragment,
  useRelayEnvironment,
} from 'react-relay';

// PILOT-DECISION: the props no longer extend antd `DescriptionsProps` (a
// type-only antd import still keeps the module in the antd import graph, P15).
// The sole consumer — `FolderExplorerModal` — passes only `vfolderNodeFrgmt`,
// which is exactly what the V2 twin's interface already declares.
interface VFolderNodeDescriptionProps {
  vfolderNodeFrgmt: VFolderNodeDescriptionFragment$key;
}

const VFolderNodeDescription: React.FC<VFolderNodeDescriptionProps> = ({
  vfolderNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
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

  const items = filterOutEmpty([
    !vfolderNode?.unmanaged_path && {
      key: 'path',
      // PILOT-DECISION (V2 precedent): the copy affordance moves from the
      // LABEL to the VALUE — `MetadataListItem.label` is a plain string (P2).
      label: t('data.folders.Path'),
      children: (
        <HStack gap={1} align="start" wrap="wrap">
          <VirtualFolderPath vfolderNodeFrgmt={vfolderNode} />
          <BAIText copyable={{ text: vfolderPath }} />
        </HStack>
      ),
    },
    {
      key: 'status',
      label: t('data.folders.Status'),
      children: (
        // BAITag DISSOLVES into `Badge`; the variant comes from the global
        // ticket-13 lookup, replacing the imported `statusTagColor` map.
        <Badge
          variant={badgeVariantForStatus('vfolder', vfolderNode.status)}
          label={_.toUpper(vfolderNode.status || '')}
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
        vfolderNode?.ownership_type === 'user' ? (
          <BAIFlex gap={'xs'}>
            <Text>{t('data.User')}</Text>
            {/* The `colorTextTertiary` glyph tint is dropped — the V2 twin
                renders these icons at inherited colour. */}
            <User size="1em" />
          </BAIFlex>
        ) : (
          <BAIFlex gap={'xs'}>
            <Text>{t('data.Project')}</Text>
            <BAIUserUnionIcon />
          </BAIFlex>
        ),
    },
    (vfolderNode?.user === currentUser.uuid ||
      (baiClient.is_admin && vfolderNode?.group === currentProject?.id)) && {
      key: 'permission',
      label: t('data.folders.MountPermission'),
      children: (
        // MAPPING §3.1: two static options, no remote source -> `Selector`.
        // antd's uncontrolled `defaultValue` becomes a controlled `value` read
        // from the fragment (the same source the default came from), and
        // `popupMatchSelectWidth={false}` is dropped — Astryx sizes its own
        // popup (MAPPING §3.1 lists it as having no destination).
        // QA-FINDINGS Q-34 — `placement` also has to be named here (the V1
        // twin of `VFolderNodeDescriptionV2`): with no search field and no
        // placement, `Selector` overlays the selected option on the trigger and
        // the row's label and value both vanish behind the panel.
        <Selector
          placement="below"
          label={t('data.folders.MountPermission')}
          isLabelHidden
          value={
            vfolderNode.permission === 'wd'
              ? 'rw'
              : (vfolderNode.permission ?? undefined)
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
            <CircleCheck size="1em" />
          </BAIFlex>
        ) : null,
    },
    vfolderNode.user_email !== null && {
      key: 'user_email',
      label: t('data.User'),
      children: <BAIText copyable>{vfolderNode.user_email ?? ''}</BAIText>,
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
          <CircleCheck size="1em" />
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

  // antd `Descriptions bordered size="small"` -> `MetadataList
  // columns="single"` (MAPPING §4: `bordered` / `size` have no destination and
  // are DROPPED, defaults-first — the V2 twin already made this call). The
  // `styles.content` word-break override goes with them: MetadataList wraps
  // long values itself.
  return (
    <MetadataList columns="single">
      {items.map((item) => (
        <MetadataListItem key={item.key} label={item.label as string}>
          {item.children}
        </MetadataListItem>
      ))}
    </MetadataList>
  );
};

export default VFolderNodeDescription;
