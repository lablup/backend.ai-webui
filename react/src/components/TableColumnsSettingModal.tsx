import BAIModal, { BAIModalProps } from './BAIModal';
import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, theme, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface FormValues {
  searchInput?: string;
  selectedColumnKeys?: string[];
}

interface TableColumnsSettingProps extends BAIModalProps {
  open: boolean;
  onRequestClose: (formValues?: FormValues) => void;
  columns: ColumnsType<any>;
  selectKeys?: string[];
}

const TableColumnsSettingModal: React.FC<TableColumnsSettingProps> = ({
  open,
  onRequestClose,
  columns,
  selectKeys,
  ...modalProps
}) => {
  const [form] = Form.useForm<FormValues>();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const columnOptions = columns.map((column) => ({
    label: _.toString(column.title),
    value: _.toString(column.key),
  }));

  return (
    <BAIModal
      title={t('table.ManageTable')}
      open={open}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onRequestClose(values);
          })
          .catch(() => {});
      }}
      onCancel={() => {
        onRequestClose();
      }}
      {...modalProps}
    >
      <Form
        form={form}
        preserve={false}
        initialValues={{
          selectedColumnKeys:
            selectKeys ||
            columnOptions.map((columnOption) => columnOption.value),
        }}
        layout="vertical"
      >
        <Form.Item
          name="searchInput"
          label={t('table.SearchColumnToDisplay')}
          style={{ marginBottom: 0 }}
        >
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
            const searchKeyword = getFieldValue('searchInput')
              ? _.toLower(getFieldValue('searchInput'))
              : undefined;

            const filteredColumns = columnOptions.map((columnOption) =>
              _.toLower(_.toString(columnOption.label)).includes(
                searchKeyword || '',
              )
                ? columnOption
                : {
                    ...columnOption,
                    style: {
                      display: 'none',
                    },
                  },
            );
            return (
              <Form.Item name="selectedColumnKeys">
                <Checkbox.Group
                  options={filteredColumns}
                  style={{ flexDirection: 'column' }}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default TableColumnsSettingModal;
