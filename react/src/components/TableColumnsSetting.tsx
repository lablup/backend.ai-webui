import { Endpoint } from '../pages/ServingListPage';
import { Checkbox } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React from 'react';

export type ColumnsSettingKeyType = string;

interface TableColumnsSettingProps {
  columns: ColumnsType<Endpoint>;
  selectKeys: ColumnsSettingKeyType[];
  onChange: (selectedKeys: ColumnsSettingKeyType[]) => void;
}

const TableColumnsSetting: React.FC<TableColumnsSettingProps> = ({
  columns,
  selectKeys,
  onChange,
}) => {
  const optionsList = columns.map((column) => {
    return Object({ label: column.title, value: column.key });
  });

  return (
    <Checkbox.Group
      options={optionsList}
      defaultValue={selectKeys}
      onChange={(selectedKeys) => {
        const stringSelectedKeys = selectedKeys.map((selectKey) =>
          String(selectKey),
        );
        onChange(stringSelectedKeys);
      }}
      style={{ alignItems: 'center' }}
    />
  );
};

export default TableColumnsSetting;
