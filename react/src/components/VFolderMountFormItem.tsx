/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import FolderCreateModal from './FolderCreateModal';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import {
  vFolderAliasNameRegExp,
  DEFAULT_ALIAS_BASE_PATH,
} from './VFolderTable';
import { Button, Form, Input, Tooltip, Typography, theme } from 'antd';
import { BAIFlex, BAIVFolderSelect, BAIVFolderSelectRef } from 'backend.ai-ui';
import _ from 'lodash';
import { FolderOpenIcon, PlusIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import React, {
  Suspense,
  useState,
  startTransition,
  useRef,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

interface VFolderMountFormItemProps {
  filter?: string;
  currentProjectId?: string;
  label?: React.ReactNode;
}

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
  const [folderNameMap, setFolderNameMap] = useState<Record<string, string>>(
    {},
  );

  const getDefaultPath = useCallback(
    (folderId: string) =>
      DEFAULT_ALIAS_BASE_PATH + (folderNameMap[folderId] || folderId),
    [folderNameMap],
  );

  const handleResolvedNamesChange = useCallback(
    (nameMap: Record<string, string>) => {
      setFolderNameMap((prev) => ({ ...prev, ...nameMap }));
      // Set default mount paths for folders loaded from URL that don't have one yet
      const mountIds: string[] = form.getFieldValue('mount_ids') || [];
      mountIds.forEach((id) => {
        if (!form.getFieldValue(['mount_id_map', id]) && nameMap[id]) {
          form.setFieldValue(
            ['mount_id_map', id],
            DEFAULT_ALIAS_BASE_PATH + nameMap[id],
          );
        }
      });
    },
    [form],
  );

  const handleRemoveFolder = useCallback(
    (folderId: string) => {
      const currentIds: string[] = form.getFieldValue('mount_ids') || [];
      const newIds = currentIds.filter((id) => id !== folderId);
      form.setFieldValue('mount_ids', newIds);
      form.setFieldValue(['mount_id_map', folderId], undefined);
    },
    [form],
  );

  return (
    <>
      <Form.Item name={'mount_ids'} label={label}>
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
            // Set default mount path for newly selected folders
            value.forEach((id) => {
              if (!form.getFieldValue(['mount_id_map', id])) {
                const name = newNameMap[id] || folderNameMap[id] || id;
                form.setFieldValue(
                  ['mount_id_map', id],
                  DEFAULT_ALIAS_BASE_PATH + name,
                );
              }
            });
            // Clean up removed folders
            const currentMap: Record<string, string> =
              form.getFieldValue('mount_id_map') || {};
            Object.keys(currentMap).forEach((key) => {
              if (!value.includes(key)) {
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
                        openFolderExplorer(mountIds[0]);
                      }
                    }}
                  />
                </Tooltip>
                <Tooltip title={t('data.CreateFolder')}>
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
              {mountIds.map((folderId: string) => {
                const folderName = folderNameMap[folderId] || folderId;
                return (
                  <BAIFlex
                    key={folderId}
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
                      name={['mount_id_map', folderId]}
                      style={{ flex: 1, marginBottom: 0 }}
                      rules={[
                        {
                          validator(_, value) {
                            const path = value || getDefaultPath(folderId);
                            if (!vFolderAliasNameRegExp.test(path)) {
                              return Promise.reject(
                                t('session.launcher.FolderAliasInvalid'),
                              );
                            }
                            const otherPaths = mountIds
                              .filter((id) => id !== folderId)
                              .map(
                                (id) =>
                                  form.getFieldValue(['mount_id_map', id]) ||
                                  getDefaultPath(id),
                              );
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
                      onClick={() => handleRemoveFolder(folderId)}
                    />
                  </BAIFlex>
                );
              })}
            </BAIFlex>
          );
        }}
      </Form.Item>
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

export default VFolderMountFormItem;
