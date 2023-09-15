import VFolderTable from './VFolderTable';
import { Form, FormItemProps } from 'antd';
import React from 'react';

interface VFolderTableFromItemProps extends FormItemProps {}

const VFolderTableFromItem: React.FC<VFolderTableFromItemProps> = ({
  ...formItemProps
}) => {
  return (
    <Form.Item
      name={'vfolders'}
      {...formItemProps}
      valuePropName="selectedRowKeys"
      trigger="onChangeSelectedRowKeys"
      // getValueFromEvent={(selectedRowKeys) => {
      //   console.log('xxxxxx');
      //   return selectedRowKeys;
      // }}
    >
      <VFolderTable
        rowKey="name"
        // onChangeSelectedRowKeys={(values) => {
        //   console.log(values);
        // }}
      />
    </Form.Item>
  );
};

export default VFolderTableFromItem;
