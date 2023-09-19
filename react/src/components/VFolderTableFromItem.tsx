import VFolderTable, { AliasMap } from './VFolderTable';
import { Form, FormItemProps } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface VFolderTableFromItemProps extends Omit<FormItemProps, 'name'> {}

export interface VFolderTableFormValues {
  vfolders: string[];
  vfoldersAliasMap: AliasMap;
}

const VFolderTableFromItem: React.FC<VFolderTableFromItemProps> = ({
  ...formItemProps
}) => {
  const form = Form.useFormInstance();
  const { t } = useTranslation();
  Form.useWatch('vfoldersAliasMap', form);
  return (
    <>
      <Form.Item
        noStyle
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
              return Promise.resolve();
            },
          },
        ]}
      ></Form.Item>
      <Form.Item
        name={'mounts'}
        {...formItemProps}
        valuePropName="selectedRowKeys"
        trigger="onChangeSelectedRowKeys"
      >
        <VFolderTable
          rowKey="name"
          showAliasInput
          aliasMap={form.getFieldValue('vfoldersAliasMap')}
          onChangeAliasMap={(aliasMap) => {
            form.setFieldValue('vfoldersAliasMap', aliasMap);
            form.validateFields(['vfoldersAliasMap']);
          }}
        />
      </Form.Item>
    </>
  );
};

export default VFolderTableFromItem;
