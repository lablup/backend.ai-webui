import VFolderTable from './VFolderTable';
import { Form, FormItemProps, Input } from 'antd';
import React, { useState } from 'react';

interface VFolderTableFromItemProps extends FormItemProps {}

const VFolderTableFromItem: React.FC<VFolderTableFromItemProps> = ({
  ...formItemProps
}) => {
  const form = Form.useFormInstance();
  // const [aliasMap, setAliasMap] = useState({});
  return (
    <>
      <Form.Item
        name={'vfolders'}
        {...formItemProps}
        valuePropName="selectedRowKeys"
        trigger="onChangeSelectedRowKeys"
        // getValueFromEvent={(selectedRowKeys) => {
        //   console.log('xxxxxx');
        //   return selectedRowKeys;
        // }}
        dependencies={['vfoldersAliasMap']}
      >
        <VFolderTable
          rowKey="name"
          showAliasInput
          aliasMap={form.getFieldValue('vfoldersAliasMap')}
          onChangeAliasMap={(aliasMap) => {
            form.setFieldValue('vfoldersAliasMap', aliasMap);
          }}
          // onChangeSelectedRowKeys={(values) => {
          //   console.log(values);
          // }}
        />
      </Form.Item>
      <Form.Item noStyle name="vfoldersAliasMap"></Form.Item>
    </>
  );
};

export default VFolderTableFromItem;
