import { Endpoint } from '../pages/ServingListPage';
import { Checkbox } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { ColumnsType } from 'antd/es/table';
import React from 'react';

interface TableColumnsSettingProps {
  columns: ColumnsType<Endpoint>;
  selectKeys: CheckboxValueType[];
  onChange: (selectedKeys: CheckboxValueType[]) => void;
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
      onChange={(selectedKeys) => onChange(selectedKeys)}
      style={{ alignItems: 'center' }}
    />
  );
};

export default TableColumnsSetting;
