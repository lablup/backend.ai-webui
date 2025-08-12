import { useEventNotStable } from '../hooks/useEventNotStable';
import { VFolder } from './VFolderSelect';
import VFolderTable, {
  AliasMap,
  DEFAULT_ALIAS_BASE_PATH,
  VFolderTableProps,
  vFolderAliasNameRegExp,
} from './VFolderTable';
import { App, Form, FormItemProps, Input } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VFolderTableFormItemProps extends Omit<FormItemProps, 'name'> {
  rowFilter?: VFolderTableProps['rowFilter'];
  rowKey?: keyof VFolder;
  tableProps?: Partial<VFolderTableProps>;
}

export interface VFolderTableFormValues {
  // The mounts field has been deprecated but is retained for backward compatibility
  mounts?: string[];
  mount_ids?: string[];
  mount_id_map?: Record<string, string>;
  vfoldersNameMap?: Record<string, string>;
  autoMountedFolderNames?: string[];
}

const VFolderTableFormItem: React.FC<VFolderTableFormItemProps> = ({
  rowFilter,
  rowKey = 'name',
  tableProps,
  ...formItemProps
}) => {
  const form = Form.useFormInstance();
  const { t } = useTranslation();

  const { message } = App.useApp();
  return (
    <>
      <Form.Item
        hidden
        name={'mount_id_map'}
        rules={[
          {
            validator(rule, map) {
              const arr = _.chain(form.getFieldValue('mount_ids'))
                .reduce((result, name) => {
                  result[name] = map[name] || '/home/work/' + name;
                  return result;
                }, {} as AliasMap)
                .values()
                .value();
              if (_.uniq(arr).length !== arr.length) {
                return Promise.reject(
                  t('session.launcher.FolderAliasOverlapping'),
                );
              }
              if (_.some(arr, (alias) => !vFolderAliasNameRegExp.test(alias))) {
                return Promise.reject(t('session.launcher.FolderAliasInvalid'));
              }

              if (
                _.some(
                  form.getFieldValue('autoMountedFolderNames'),
                  (autoName) =>
                    arr.includes(DEFAULT_ALIAS_BASE_PATH + autoName),
                )
              ) {
                return Promise.reject(
                  t('session.launcher.FolderAliasOverlappingToAutoMount'),
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input />
      </Form.Item>
      {/* The mounts field has been deprecated but is retained for backward compatibility */}
      <Form.Item hidden name="mounts">
        <div />
      </Form.Item>
      <Form.Item hidden name="autoMountedFolderNames">
        <div />
      </Form.Item>
      <Form.Item hidden name="vfoldersNameMap">
        <div />
      </Form.Item>
      <Form.Item
        name={'mount_ids'}
        {...formItemProps}
        valuePropName="selectedRowKeys"
        trigger="onChangeSelectedRowKeys"
      >
        <VFolderTable
          key={tableProps?.ownerEmail}
          rowKey={rowKey}
          showAliasInput
          aliasMap={form.getFieldValue('mount_id_map')}
          onChangeAliasMap={useEventNotStable((aliasMap) => {
            form.setFieldValue('mount_id_map', aliasMap);
            form.validateFields(['mount_id_map']);
          })}
          // TODO: implement pagination
          pagination={false}
          rowFilter={rowFilter}
          showAutoMountedFoldersSection
          onChangeAutoMountedFolders={useEventNotStable((names) => {
            form.setFieldValue('autoMountedFolderNames', names);
          })}
          onValidateSelectedRowKeys={useEventNotStable(
            (invalidKeys, validVFolders) => {
              form.setFieldValue(
                'mount_ids',
                _.difference(form.getFieldValue('mount_ids'), invalidKeys),
              );
              form.setFieldValue(
                'mount_id_map',
                _.omitBy(form.getFieldValue('mount_id_map'), (alias, key) =>
                  invalidKeys.includes(key),
                ),
              );

              form.setFieldValue(
                'vfoldersNameMap',
                _.reduce(
                  validVFolders,
                  (acc, vf) => {
                    // @ts-ignore
                    acc[vf[rowKey]] = vf.name;
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
              );

              if (invalidKeys.length > 0) {
                message.warning(
                  t('session.launcher.InvalidMountsSelectionWarning'),
                );
              }
            },
          )}
          {...tableProps}
        />
      </Form.Item>
    </>
  );
};

export default VFolderTableFormItem;
