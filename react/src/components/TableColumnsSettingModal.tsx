import BAIModal, { BAIModalProps } from './BAIModal';
import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, theme, Form } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FormInstance } from 'antd/lib';
import _ from 'lodash';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface FormValues {
  searchInput?: string;
  selectedColumnKeys?: Array<string>;
}

interface TableColumnsSettingProps extends BAIModalProps {
  open: boolean;
  onRequestClose: (formValues?: FormValues) => void;
  columns: ColumnsType<any>;
  hiddenColumnKeys?: Array<string>;
}

const TableColumnsSettingModal: React.FC<TableColumnsSettingProps> = ({
  open,
  onRequestClose,
  columns,
  hiddenColumnKeys,
  ...modalProps
}) => {
  const formRef = useRef<FormInstance>(null);
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

  const columnOptions = _.map(columns, (column) => {
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
      destroyOnHidden
      centered
      onOk={() => {
        formRef.current
          ?.validateFields()
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
        ref={formRef}
        preserve={false}
        initialValues={{
          selectedColumnKeys: _.map(columnOptions, 'value')?.filter(
            (columnKey) => !_.includes(hiddenColumnKeys, columnKey),
          ),
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

            const filteredColumns = _.map(columnOptions, (columnOption) =>
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
                  height: 220,
                  overflowY: 'auto',
                }}
                rules={[
                  {
                    required: true,
                    message: t('general.validation.PleaseSelectOptions'),
                  },
                ]}
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
