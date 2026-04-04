/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderMountFormItemAutoMountQuery } from '../__generated__/VFolderMountFormItemAutoMountQuery.graphql';
import FolderCreateModal from './FolderCreateModal';
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
  List,
  theme,
} from 'antd';
import {
  BAIFlex,
  BAIVFolderSelect,
  BAIVFolderSelectRef,
  toLocalId,
} from 'backend.ai-ui';
import _ from 'lodash';
import { FolderOpenIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import React, { Suspense, useState, startTransition, useRef } from 'react';
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
            onChange={(value: string[], options: unknown) => {
              // Track folder names from the selected options
              if (Array.isArray(options)) {
                const newNameMap = { ...folderNameMap };
                (options as Array<{ label: string; value: string }>).forEach(
                  (opt) => {
                    if (opt?.value && opt?.label) {
                      newNameMap[opt.value] = opt.label;
                    }
                  },
                );
                setFolderNameMap(newNameMap);
              }

              // Clean up mount path entries for deselected folders (keyed by localId)
              const currentMap = form.getFieldValue('mount_id_map') || {};
              const validLocalIds = new Set(
                value.map((globalId) => toLocalId(globalId)),
              );
              const updatedMap = _.pickBy(currentMap, (_v, key) =>
                validLocalIds.has(key),
              );
              form.setFieldValue('mount_id_map', updatedMap);
              form.validateFields(['mount_id_map']);
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
      <Form.Item
        hidden
        name="mount_id_map"
        initialValue={{}}
        rules={[
          {
            validator(_rule, map) {
              const mountIds: string[] = form.getFieldValue('mount_ids') || [];
              if (mountIds.length === 0) {
                return Promise.resolve();
              }
              const paths = mountIds.map((globalId: string) => {
                const localId = toLocalId(globalId);
                return map?.[localId] || DEFAULT_ALIAS_BASE_PATH + localId;
              });
              if (_.uniq(paths).length !== paths.length) {
                return Promise.reject(
                  t('session.launcher.FolderAliasOverlapping'),
                );
              }
              if (
                paths.some((path: string) => !vFolderAliasNameRegExp.test(path))
              ) {
                return Promise.reject(t('session.launcher.FolderAliasInvalid'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item noStyle dependencies={['mount_ids']}>
        {({ getFieldValue }) => {
          const mountIds: string[] = getFieldValue('mount_ids') || [];
          if (mountIds.length === 0) return null;

          return (
            <List
              size="small"
              dataSource={mountIds}
              style={{ marginBottom: token.marginLG }}
              renderItem={(globalId: string) => {
                const localId = toLocalId(globalId);
                const folderName = folderNameMap[globalId] || localId;
                const mountIdMap = form.getFieldValue('mount_id_map') || {};
                const currentPath =
                  mountIdMap[localId] || DEFAULT_ALIAS_BASE_PATH + localId;

                return (
                  <List.Item style={{ paddingInline: 0 }}>
                    <BAIFlex
                      direction="row"
                      align="center"
                      gap={token.sizeXS}
                      style={{ width: '100%' }}
                    >
                      <Typography.Text
                        ellipsis={{ tooltip: true }}
                        style={{
                          minWidth: 120,
                          maxWidth: 200,
                          flexShrink: 0,
                        }}
                      >
                        {folderName}
                      </Typography.Text>
                      <Input
                        size="small"
                        value={currentPath}
                        prefix={
                          <Typography.Text type="secondary">
                            {t('session.launcher.FolderAlias')}:
                          </Typography.Text>
                        }
                        onChange={(e) => {
                          const newMap = {
                            ...form.getFieldValue('mount_id_map'),
                            [localId]: e.target.value,
                          };
                          form.setFieldValue('mount_id_map', newMap);
                          form.validateFields(['mount_id_map']);
                        }}
                        status={
                          !vFolderAliasNameRegExp.test(currentPath)
                            ? 'error'
                            : undefined
                        }
                        style={{ flex: 1 }}
                      />
                    </BAIFlex>
                  </List.Item>
                );
              }}
            />
          );
        }}
      </Form.Item>
      {currentProjectId && (
        <Suspense fallback={<Skeleton.Input active size="small" block />}>
          <AutoMountFolderSection currentProjectId={currentProjectId} />
        </Suspense>
      )}
      <Suspense>
        <FolderCreateModal
          open={isFolderCreateModalOpen}
          hiddenFormItems={[
            'usage_mode',
            'usage_mode_model',
            'usage_mode_automount',
          ]}
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

  const autoMountNames = _.chain(vfolder_nodes?.edges)
    .map((edge) => edge?.node?.name)
    .compact()
    .value();

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
