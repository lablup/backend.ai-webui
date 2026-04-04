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
import { Button, Form, Input, Tooltip, Typography, List, theme } from 'antd';
import { BAIFlex, BAIVFolderSelect, BAIVFolderSelectRef } from 'backend.ai-ui';
import _ from 'lodash';
import { FolderOpenIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import React, { Suspense, useState, startTransition, useRef } from 'react';
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

  return (
    <>
      <Form.Item name={'mount_ids'} label={label}>
        <BAIVFolderSelect
          ref={vFolderSelectRef}
          mode="multiple"
          allowClear
          currentProjectId={currentProjectId}
          filter={filter}
          onChange={(value: string[]) => {
            // When folders are deselected, clean up their mount path entries
            const currentMap = form.getFieldValue('mount_id_map') || {};
            const updatedMap = _.pick(currentMap, value);
            form.setFieldValue('mount_id_map', updatedMap);
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
      <Form.Item
        hidden
        name="mount_id_map"
        initialValue={{}}
        rules={[
          {
            validator(_rule, map) {
              const mountIds = form.getFieldValue('mount_ids') || [];
              if (mountIds.length === 0) {
                return Promise.resolve();
              }
              const paths = mountIds.map(
                (id: string) => map?.[id] || DEFAULT_ALIAS_BASE_PATH + id,
              );
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
              renderItem={(folderId: string) => {
                const mountIdMap = form.getFieldValue('mount_id_map') || {};
                const currentPath =
                  mountIdMap[folderId] || DEFAULT_ALIAS_BASE_PATH + folderId;

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
                        {folderId}
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
                            [folderId]: e.target.value,
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
