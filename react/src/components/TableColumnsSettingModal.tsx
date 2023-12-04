import { Endpoint } from '../pages/ServingListPage';
import BAIModal, { BAIModalProps } from './BAIModal';
import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, theme, Form } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
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
  const [selectedKeys, setSelectedKeys] = useState(selectKeys);

  const handleOk = () => {
    onChangeSelectedKeys(selectedKeys);
    onRequestClose();
  };

  return (
    <BAIModal
      title={t('modelService.TableColumnSetting')}
      open={open}
      onOk={handleOk}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <Form form={form}>
        <Form.Item name="searchInput">
          <Input
            prefix={<SearchOutlined />}
            style={{ marginBottom: token.marginSM }}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.searchInput !== cur.searchInput}
        >
          {({ getFieldValue }) => {
            const searchColumn = getFieldValue('searchInput');
            const searchColumnsResult = columns
              .filter((column) =>
                RegExp(searchColumn).test(String(column.title)),
              )
              .map((searchColumn) =>
                Object({
                  label: String(searchColumn.title),
                  value: String(searchColumn.key),
                }),
              );
            const unSearchdeColumnsKey = columns
              .filter(
                (column) => !RegExp(searchColumn).test(String(column.title)),
              )
              .map((unSearchedColumn) => String(unSearchedColumn.key));
            const onChangeCheckbox = (
              checkedColumnsKey: CheckboxValueType[],
            ) => {
              const stringCheckedColumnsKey = checkedColumnsKey.map(
                (columnsKey) => String(columnsKey),
              );
              setSelectedKeys(
                unSearchdeColumnsKey.concat(stringCheckedColumnsKey),
              );
            };
            return (
              <Checkbox.Group
                options={searchColumnsResult}
                style={{ flexDirection: 'column' }}
                onChange={onChangeCheckbox}
                value={selectedKeys}
              />
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default TableColumnsSettingModal;
