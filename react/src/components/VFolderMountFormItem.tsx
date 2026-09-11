/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderMountFormItemAutoMountQuery } from '../__generated__/VFolderMountFormItemAutoMountQuery.graphql';
import { Form } from '../form-engine';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { toProjectContext } from '../types/projectContext';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import {
  vFolderAliasNameRegExp,
  DEFAULT_ALIAS_BASE_PATH,
} from './VFolderTable';
import { AstryxFormTextInput } from './astryxFormControls';
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAISkeleton,
  BAIFlex,
  BAIMetadataList,
  BAIVFolderSelect,
  BAIVFolderSelectRef,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { FolderOpenIcon, PlusIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import React, {
  Suspense,
  useState,
  startTransition,
  useRef,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Form item for selecting vfolders with mount path configuration.
 * Expects parent form to have fields: mount_ids (string[]), mount_id_map (Record<string, string>)
 *
 * mount_ids stores global IDs (from BAIVFolderSelect).
 * mount_id_map stores {localId: mountPath} — keys are local UUIDs (via toLocalId)
 * to match the submit logic in ServiceLauncherPageContent.
 */

interface VFolderMountFormItemProps {
  filter?: string;
  currentProjectId?: string;
  label?: React.ReactNode;
}

/**
 * Tracks folder name by global ID so we can display names in the mount path list.
 * Fed exclusively by `BAIVFolderSelect.onResolvedNamesChange` (P3C-3):
 * the Astryx sibling's `onChange` carries no option argument, and its
 * value-resolution query already emits the id→name map for newly selected keys
 * as well as pre-existing ones.
 */
type FolderNameMap = Record<string, string>;

const VFolderMountFormItem: React.FC<VFolderMountFormItemProps> = ({
  filter,
  currentProjectId,
  label,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const form = Form.useFormInstance();
  const currentProject = useCurrentProjectValue();
  const { open: openFolderExplorer } = useFolderExplorerOpener();
  const [isFolderCreateModalOpen, setIsFolderCreateModalOpen] = useState(false);
  const vFolderSelectRef = useRef<BAIVFolderSelectRef>(null);
  const [folderNameMap, setFolderNameMap] = useState<FolderNameMap>({});

  const getDefaultPath = useCallback(
    (globalId: string) => {
      const localId = toLocalId(globalId);
      return DEFAULT_ALIAS_BASE_PATH + (folderNameMap[globalId] || localId);
    },
    [folderNameMap],
  );

  const handleResolvedNamesChange = useCallback(
    (nameMap: Record<string, string>) => {
      setFolderNameMap((prev) => ({ ...prev, ...nameMap }));
      // Set default mount paths for folders loaded from URL that don't have one yet
      const mountIds: string[] = form.getFieldValue('mount_ids') || [];
      mountIds.forEach((globalId) => {
        const localId = toLocalId(globalId);
        if (
          !form.getFieldValue(['mount_id_map', localId]) &&
          nameMap[globalId]
        ) {
          form.setFieldValue(
            ['mount_id_map', localId],
            DEFAULT_ALIAS_BASE_PATH + nameMap[globalId],
          );
        }
      });
    },
    [form],
  );

  const handleRemoveFolder = useCallback(
    (globalId: string) => {
      const currentIds: string[] = form.getFieldValue('mount_ids') || [];
      const newIds = currentIds.filter((id) => id !== globalId);
      form.setFieldValue('mount_ids', newIds);
      const localId = toLocalId(globalId);
      form.setFieldValue(['mount_id_map', localId], undefined);
    },
    [form],
  );

  return (
    <>
      <Form.Item name={'mount_ids'} label={label}>
        <Suspense fallback={<BAISkeleton variant="input" />}>
          <BAIVFolderSelect
            ref={vFolderSelectRef}
            label={t('session.launcher.FolderToMount')}
            isLabelHidden
            multiple
            currentProjectId={currentProjectId}
            filter={filter}
            onResolvedNamesChange={handleResolvedNamesChange}
            onChange={(value) => {
              const mountIds = _.castArray(value ?? []);
              const previousIds: string[] =
                form.getFieldValue('mount_ids') || [];
              form.setFieldValue('mount_ids', mountIds);
              // Default mount paths are written by `handleResolvedNamesChange`
              // alone (P3C-3); here we only drop the state of deselected
              // folders — their cached name and their alias-path entry.
              setFolderNameMap((prev) => _.pick(prev, mountIds));
              _.forEach(_.difference(previousIds, mountIds), (globalId) => {
                form.setFieldValue(
                  ['mount_id_map', toLocalId(globalId)],
                  undefined,
                );
              });
            }}
            footer={
              <BAIFlex
                justify="end"
                gap="xxs"
                style={{
                  padding: token('--spacing-1'),
                  borderTop: `1px solid ${token('--color-border')}`,
                }}
              >
                {/* MAPPING §3.3: `type="text"` icon-only buttons wrapped in
                    Tooltips collapse into ghost `IconButton`s, which own both
                    the tooltip and the accessible name. */}
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<FolderOpenIcon />}
                  label={t('modelService.OpenFolder')}
                  tooltip={t('modelService.OpenFolder')}
                  isDisabled={_.isEmpty(form.getFieldValue('mount_ids'))}
                  onClick={() => {
                    const mountIds = form.getFieldValue('mount_ids') || [];
                    if (mountIds.length > 0) {
                      openFolderExplorer(toLocalId(mountIds[0]));
                    }
                  }}
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<PlusIcon />}
                  label={t('data.CreateANewStorageFolder')}
                  tooltip={t('data.CreateANewStorageFolder')}
                  onClick={() => setIsFolderCreateModalOpen(true)}
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCwIcon />}
                  label={t('button.Refresh')}
                  tooltip={t('button.Refresh')}
                  onClick={() => {
                    startTransition(() => {
                      vFolderSelectRef.current?.refetch();
                    });
                  }}
                />
              </BAIFlex>
            }
          />
        </Suspense>
      </Form.Item>
      <Form.Item noStyle dependencies={['mount_ids']}>
        {({ getFieldValue }) => {
          const mountIds: string[] = getFieldValue('mount_ids') || [];
          if (mountIds.length === 0) return null;

          return (
            <BAIFlex
              direction="column"
              gap="xxs"
              style={{ marginBottom: token('--spacing-6') }}
            >
              {mountIds.map((globalId: string) => {
                const localId = toLocalId(globalId);
                const folderName = folderNameMap[globalId] || localId;
                return (
                  <BAIFlex
                    key={globalId}
                    direction="row"
                    align="start"
                    gap="xxs"
                  >
                    {/* `ellipsis={{tooltip:true}}` -> `maxLines` +
                        `hasTruncateTooltip` (MAPPING §3.4). */}
                    <Text
                      maxLines={1}
                      hasTruncateTooltip
                      style={{
                        width: 150,
                        flexShrink: 0,
                        lineHeight: '24px',
                      }}
                    >
                      {folderName}
                    </Text>
                    <Form.Item
                      name={['mount_id_map', localId]}
                      style={{ flex: 1, marginBottom: 0 }}
                      rules={[
                        {
                          validator(_, value) {
                            const path = value || getDefaultPath(globalId);
                            if (!vFolderAliasNameRegExp.test(path)) {
                              return Promise.reject(
                                t('session.launcher.FolderAliasInvalid'),
                              );
                            }
                            const otherPaths = mountIds
                              .filter((id) => id !== globalId)
                              .map((id) => {
                                const otherId = toLocalId(id);
                                return (
                                  form.getFieldValue([
                                    'mount_id_map',
                                    otherId,
                                  ]) || getDefaultPath(id)
                                );
                              });
                            if (otherPaths.includes(path)) {
                              return Promise.reject(
                                t('session.launcher.FolderAliasOverlapping'),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      {/* Stays at `sm` inside the row; `size` is on the
                          SHARED adapter now (D10 fold-back). */}
                      <AstryxFormTextInput
                        label={t('session.launcher.FolderAlias')}
                        size="sm"
                      />
                    </Form.Item>
                    <XIcon
                      size={16}
                      style={{
                        cursor: 'pointer',
                        color: token('--color-text-quaternary'),
                        marginTop: token('--spacing-1'),
                        flexShrink: 0,
                      }}
                      onClick={() => handleRemoveFolder(globalId)}
                    />
                  </BAIFlex>
                );
              })}
            </BAIFlex>
          );
        }}
      </Form.Item>
      {currentProjectId && (
        <Suspense fallback={<BAISkeleton variant="input" size="small" />}>
          <AutoMountFolderSection currentProjectId={currentProjectId} />
        </Suspense>
      )}
      <Suspense>
        <FolderCreateModalV2
          open={isFolderCreateModalOpen}
          project={toProjectContext(currentProject)}
          // TODO: hiddenFormItems prop was removed from FolderCreateModalV2.
          // This component is currently unused; revisit if it gets re-enabled.
          // hiddenFormItems={[
          //   'usage_mode',
          //   'usage_mode_model',
          //   'usage_mode_automount',
          // ]}
          initialValues={{ usage_mode: 'general' }}
          onRequestClose={(response) => {
            setIsFolderCreateModalOpen(false);
            if (response) {
              startTransition(() => {
                vFolderSelectRef.current?.refetch();
              });
            }
          }}
        />
      </Suspense>
    </>
  );
};

/**
 * Lazy-loaded section that queries and displays auto-mount folders (name starts with '.').
 * Uses GraphQL vfolder_nodes with the same filter condition as VFolderTable and VFolderNodeListPage.
 */
const AutoMountFolderSection: React.FC<{ currentProjectId: string }> = ({
  currentProjectId,
}) => {
  'use memo';
  const { t } = useTranslation();

  const { vfolder_nodes } =
    useLazyLoadQuery<VFolderMountFormItemAutoMountQuery>(
      graphql`
        query VFolderMountFormItemAutoMountQuery(
          $scopeId: ScopeField
          $filter: String
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            filter: $filter
            first: 100
            permission: "read_attribute"
          ) {
            edges {
              node {
                name
                status
              }
            }
          }
        }
      `,
      {
        scopeId: `project:${currentProjectId}`,
        filter: 'name ilike ".%" & status == "ready"',
      },
    );

  const autoMountNames = _.compact(
    _.map(vfolder_nodes?.edges, (edge) => edge?.node?.name),
  );

  if (autoMountNames.length === 0) return null;

  return (
    // antd `Descriptions size="small"` -> `MetadataList` (MAPPING §4; `size`
    // has no destination). The colourless `<Tag>`s are Astryx's default
    // `neutral` Badge.
    <BAIMetadataList columns="single">
      <MetadataListItem label={t('data.AutomountFolders')}>
        <BAIFlex gap="xxs" wrap="wrap">
          {autoMountNames.map((name) => (
            <Badge key={name} label={name} />
          ))}
        </BAIFlex>
      </MetadataListItem>
    </BAIMetadataList>
  );
};

export default VFolderMountFormItem;
