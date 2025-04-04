import { VFolder } from './VFolderSelect';
import VFolderTable, {
  AliasMap,
  DEFAULT_ALIAS_BASE_PATH,
  VFolderTableProps,
  vFolderAliasNameRegExp,
} from './VFolderTable';
import { Form, FormItemProps, Input } from 'antd';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface VFolderTableFormItemProps extends Omit<FormItemProps, 'name'> {
  filter?: VFolderTableProps['filter'];
  rowKey?: keyof VFolder;
  tableProps?: Partial<VFolderTableProps>;
}

export interface VFolderTableFormValues {
  mounts: string[];
  vfoldersAliasMap: AliasMap;
  autoMountedFolderNames?: string[];
}

const VFolderTableFormItem: React.FC<VFolderTableFormItemProps> = ({
  filter,
  rowKey = 'name',
  tableProps,
  ...formItemProps
}) => {
  const form = Form.useFormInstance();
  const { t } = useTranslation();

  useEffect(() => {
    form.setFieldsValue({
      mounts: [],
      vfoldersAliasMap: {},
      autoMountedFolderNames: [],
    });
  }, [tableProps?.ownerEmail, form]);

  return (
    <>
      <Form.Item
        // noStyle
        hidden
        name="vfoldersAliasMap"
        rules={[
          {
            validator(rule, map) {
              const arr = _.chain(form.getFieldValue('mounts'))
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
        {/* <Flex>{form.getFieldValue('vfoldersAliasMap')}</Flex> */}
      </Form.Item>
      <Form.Item hidden name="autoMountedFolderNames" />
      <Form.Item
        name={'mounts'}
        {...formItemProps}
        valuePropName="selectedRowKeys"
        trigger="onChangeSelectedRowKeys"
      >
        <VFolderTable
          rowKey={rowKey}
          showAliasInput
          aliasMap={form.getFieldValue('vfoldersAliasMap')}
          onChangeAliasMap={(aliasMap) => {
            form.setFieldValue('vfoldersAliasMap', aliasMap);
            form.validateFields(['vfoldersAliasMap']);
          }}
          // TODO: implement pagination
          pagination={false}
          filter={filter}
          showAutoMountedFoldersSection
          onChangeAutoMountedFolders={(names) => {
            form.setFieldValue('autoMountedFolderNames', names);
          }}
          {...tableProps}
        />
      </Form.Item>
    </>
  );
};

export default VFolderTableFormItem;
