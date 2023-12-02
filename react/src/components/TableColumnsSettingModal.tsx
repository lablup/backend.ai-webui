import { Endpoint } from '../pages/ServingListPage';
import BAIModal, { BAIModalProps } from './BAIModal';
import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, theme } from 'antd';
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
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [selectedTitles, setSelectedTitles] = useState(
    columns
      .filter((column) => selectKeys.includes(String(column.key)))
      .map((selectedColumn) => String(selectedColumn.title)),
  );
  const [searchColumnsResult, setSearchColumnsResult] = useState(
    columns
      .filter((column) => RegExp('').test(String(column.title)))
      .map((searchColumn) => String(searchColumn.title)),
  );

  const onChangeSearchColumnsResult = (searchColumn: string) => {
    const searchResult = columns
      .filter((column) =>
        RegExp(searchColumn).test(String(column.title).toLowerCase()),
      )
      .map((searchColumn) => String(searchColumn.title));
    setSearchColumnsResult(searchResult);
  };

  const onChangeCheckbox = (checkedValue: CheckboxValueType[]) => {
    const checkedTitle = checkedValue.map((title) => String(title));
    setSelectedTitles(checkedTitle);
  };

  const handleOk = () => {
    const selectedKeys = columns
      .filter((column) => selectedTitles.includes(String(column.title)))
      .map((selectedColumn) => String(selectedColumn.key));
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
      <Input
        prefix={<SearchOutlined />}
        style={{ marginBottom: token.marginSM }}
        onChange={(e) =>
          onChangeSearchColumnsResult(e.target.value.toLowerCase())
        }
      />
      <Checkbox.Group
        options={searchColumnsResult}
        style={{ flexDirection: 'column' }}
        defaultValue={selectedTitles}
        onChange={onChangeCheckbox}
      />
    </BAIModal>
  );
};

export default TableColumnsSettingModal;
