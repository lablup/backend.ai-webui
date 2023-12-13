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

  const onChangeTitleToString: any = (element: any) => {
    const text = React.Children.map(element.props.children, (child) => {
      if (typeof child === 'string') {
        return child;
      }
    });
    return text;
  };

  const columnOptions = columns.map((column) => {
    if (typeof column.title === 'string') {
      return {
        label: column.title,
        value: _.toString(column.key),
      };
    } else if (typeof column.title === 'object' && 'props' in column.title!) {
      return {
        label: onChangeTitleToString(column.title),
        value: _.toString(column.key),
      };
    } else {
      return {
        label: undefined,
        value: _.toString(column.key),
      };
    }
  });

  return (
    <BAIModal
      title={t('table.SettingTable')}
      open={open}
      destroyOnClose
      centered
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
          label={t('table.SelectColumnToDisplay')}
          style={{ marginBottom: 0 }}
        >
          <Input
            prefix={<SearchOutlined />}
            style={{ marginBottom: token.marginSM }}
            placeholder={t('table.SearchTableColumn')}
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
              <Form.Item
                name="selectedColumnKeys"
                style={{
                  height: 180,
                  overflowY: 'auto',
                }}
              >
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
