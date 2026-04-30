/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderMountFormItemAutoMountQuery,
  VFolderFilter,
} from '../__generated__/VFolderMountFormItemAutoMountQuery.graphql';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import {
  vFolderAliasNameRegExp,
  DEFAULT_ALIAS_BASE_PATH,
} from './VFolderTable';
import {
  Button,
  Descriptions,
  Form,
  Input,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {
  BAIFlex,
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
  filter?: VFolderFilter | null;
  currentProjectId?: string;
  label?: React.ReactNode;
}

/**
 * Tracks folder name by global ID so we can display names in the mount path list.
 * Built from BAIVFolderSelect's labelInValue-style options.
 */
type FolderNameMap = Record<string, string>;

const VFolderMountFormItem: React.FC<VFolderMountFormItemProps> = ({
  filter,
  currentProjectId,
  label,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const form = Form.useFormInstance();
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
        <Suspense fallback={<Skeleton.Input active block />}>
          <BAIVFolderSelect
            ref={vFolderSelectRef}
            mode="multiple"
            allowClear
            currentProjectId={currentProjectId}
            filter={filter}
            onResolvedNamesChange={handleResolvedNamesChange}
            onChange={(value: string[], option: any) => {
              form.setFieldValue('mount_ids', value);
              // Build id→name map from selected options
              const options = _.castArray(option);
              const newNameMap: Record<string, string> = {};
              options.forEach((opt: { label?: string; value?: string }) => {
                if (opt?.value && opt?.label) {
                  newNameMap[opt.value] = opt.label;
                }
              });
              setFolderNameMap((prev) => ({
                ..._.pick(prev, value),
                ...newNameMap,
              }));
              // Set default mount path for newly selected folders (keyed by localId)
              value.forEach((globalId) => {
                const localId = toLocalId(globalId);
                if (!form.getFieldValue(['mount_id_map', localId])) {
                  const name =
                    newNameMap[globalId] || folderNameMap[globalId] || localId;
                  form.setFieldValue(
                    ['mount_id_map', localId],
                    DEFAULT_ALIAS_BASE_PATH + name,
                  );
                }
              });
              // Clean up removed folders (keyed by localId)
              const currentMap: Record<string, string> =
                form.getFieldValue('mount_id_map') || {};
              const validLocalIds = new Set(
                value.map((globalId) => toLocalId(globalId)),
              );
              Object.keys(currentMap).forEach((key) => {
                if (!validLocalIds.has(key)) {
                  form.setFieldValue(['mount_id_map', key], undefined);
                }
              });
            }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <BAIFlex
                  justify="end"
                  gap={token.sizeXXS}
                  style={{
                    padding: token.paddingXXS,
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Tooltip title={t('modelService.OpenFolder')}>
                    <Button
                      type="text"
                      size="small"
                      icon={<FolderOpenIcon />}
                      disabled={_.isEmpty(form.getFieldValue('mount_ids'))}
                      onClick={() => {
                        const mountIds = form.getFieldValue('mount_ids') || [];
                        if (mountIds.length > 0) {
                          openFolderExplorer(toLocalId(mountIds[0]));
                        }
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t('data.CreateANewStorageFolder')}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusIcon />}
                      onClick={() => setIsFolderCreateModalOpen(true)}
                    />
                  </Tooltip>
                  <Tooltip title={t('button.Refresh')}>
                    <Button
                      type="text"
                      size="small"
                      icon={<RefreshCwIcon />}
                      onClick={() => {
                        startTransition(() => {
                          vFolderSelectRef.current?.refetch();
                        });
                      }}
                    />
                  </Tooltip>
                </BAIFlex>
              </>
            )}
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
              style={{ marginBottom: token.marginLG }}
            >
              {mountIds.map((globalId: string) => {
                const localId = toLocalId(globalId);
                const folderName = folderNameMap[globalId] || localId;
                return (
                  <BAIFlex
                    key={globalId}
                    direction="row"
                    align="start"
                    gap={token.sizeXXS}
                  >
                    <Typography.Text
                      ellipsis={{ tooltip: true }}
                      style={{
                        width: 150,
                        flexShrink: 0,
                        lineHeight: '24px',
                      }}
                    >
                      {folderName}
                    </Typography.Text>
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
                      <Input size="small" />
                    </Form.Item>
                    <XIcon
                      size={16}
                      style={{
                        cursor: 'pointer',
                        color: token.colorTextQuaternary,
                        marginTop: token.marginXXS,
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
        <Suspense fallback={<Skeleton.Input active size="small" block />}>
          <AutoMountFolderSection currentProjectId={currentProjectId} />
        </Suspense>
      )}
      <Suspense>
        <FolderCreateModalV2
          open={isFolderCreateModalOpen}
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
 * Uses the Strawberry V2 `projectVfolders` query with a `VFolderFilter` that
 * mirrors the previous filter string (`name ilike ".%" & status == "ready"`).
 */
const AutoMountFolderSection: React.FC<{ currentProjectId: string }> = ({
  currentProjectId,
}) => {
  'use memo';
  const { t } = useTranslation();

  const { projectVfolders } =
    useLazyLoadQuery<VFolderMountFormItemAutoMountQuery>(
      graphql`
        query VFolderMountFormItemAutoMountQuery(
          $projectId: UUID!
          $filter: VFolderFilter
          $limit: Int
        ) {
          projectVfolders(
            projectId: $projectId
            filter: $filter
            limit: $limit
          ) {
            edges {
              node {
                id
                status
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      {
        projectId: currentProjectId,
        filter: {
          AND: [
            { name: { iStartsWith: '.' } },
            { status: { equals: 'READY' } },
          ],
        },
        limit: 100,
      },
    );

  const autoMountNames = _.compact(
    _.map(projectVfolders?.edges, (edge) => edge?.node?.metadata?.name),
  );

  if (autoMountNames.length === 0) return null;

  return (
    <Descriptions size="small" style={{ marginBottom: 8 }}>
      <Descriptions.Item label={t('data.AutomountFolders')}>
        {autoMountNames.map((name) => (
          <Tag key={name}>{name}</Tag>
        ))}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default VFolderMountFormItem;
