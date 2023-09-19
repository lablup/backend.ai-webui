import VFolderTable, { AliasMap } from './VFolderTable';
import { Form, FormItemProps } from 'antd';
import React from 'react';

interface VFolderTableFromItemProps extends FormItemProps {}

export interface VFolderTableFormValues {
  vfolders: string[];
  vfoldersAliasMap: AliasMap;
}

const VFolderTableFromItem: React.FC<VFolderTableFromItemProps> = ({
  ...formItemProps
}) => {
  const form = Form.useFormInstance();
  Form.useWatch('vfoldersAliasMap', form);
  return (
    <>
      <Form.Item noStyle name="vfoldersAliasMap"></Form.Item>
      <Form.Item
        name={'vfolders'}
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
          }}
        />
      </Form.Item>
    </>
  );
};

export default VFolderTableFromItem;
