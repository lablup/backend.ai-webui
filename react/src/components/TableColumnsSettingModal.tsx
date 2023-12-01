import { Endpoint } from '../pages/ServingListPage';
import BAIModal, { BAIModalProps } from './BAIModal';
import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, theme, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type ColumnsSettingKeyType = string;

interface TableColumnsSettingProps extends BAIModalProps {
  open: boolean;
  onRequestClose: () => void;
  columns: ColumnsType<Endpoint>;
  selectKeys: ColumnsSettingKeyType[];
  onChangeSelectedKeys: (selectedKeys: ColumnsSettingKeyType[]) => void;
}

const TableColumnsSettingModal: React.FC<TableColumnsSettingProps> = ({
  open,
  onRequestClose,
  columns,
  selectKeys,
  onChangeSelectedKeys,
  ...modalProps
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [searchColumn, setSearchColumn] = useState('');

  const filteredColumns = columns.filter((column) =>
    RegExp(searchColumn).test(String(column.title)),
  );

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log(values.selectedKeys);
    });
  };

  return (
    <BAIModal
      title={t('modelService.TableColumnSetting')}
      open={open}
      onOk={handleOk}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <Input
        prefix={<SearchOutlined />}
        style={{ marginBottom: token.marginSM }}
        onChange={(e) => {
          setSearchColumn(e.target.value);
        }}
      />
      <Form
        form={form}
        initialValues={{
          selectedKeys: columns
            .filter((column) => selectKeys.includes(String(column.key)))
            .map((column) => String(column.title)),
        }}
      >
        <Form.Item name="selectedKeys">
          <Checkbox.Group
            options={filteredColumns.map((column) => String(column.title))}
            style={{ flexDirection: 'column' }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default TableColumnsSettingModal;
