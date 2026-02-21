import BAIButton from '../BAIButton';
import BAIModal, { BAIModalProps } from '../BAIModal';
import { BAIColumnsType } from './BAITable';
import { SearchOutlined } from '@ant-design/icons';
import { Input, theme, Form, Table, Checkbox, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { FormInstance } from 'antd/lib';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BAITableColumnCSVExportModalProps extends BAIModalProps {
  onRequestClose?: (success: boolean) => void;
  onExport: (selectedExportKeys: string[]) => Promise<void>;
  supportedFields: string[];
  columns: BAIColumnsType<any>;
}

const BAITableColumnCSVExportModal: React.FC<
  BAITableColumnCSVExportModalProps
> = ({ onRequestClose, onExport, supportedFields, columns, ...modalProps }) => {
  'use memo';

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
    let label: string;
    if (typeof column.title === 'string') {
      label = column.title;
    } else if (typeof column.title === 'object' && 'props' in column.title!) {
      label = onChangeTitleToString(column.title);
    } else {
      label = '';
    }

    // Skip column groups (they have children)
    if ('children' in column) {
      return {
        key: _.toString(column.key),
        label,
        exportKey: null,
        selectable: false,
      };
    }

    // Get export key (exportKey > dataIndex > null)
    let exportKey: string | null = null;
    if (column.exportKey) {
      exportKey = column.exportKey;
    } else if (column.dataIndex) {
      exportKey = Array.isArray(column.dataIndex)
        ? column.dataIndex.join('.')
        : _.toString(column.dataIndex);
    }

    // Check if exportKey is supported
    const isSupported =
      exportKey !== null && supportedFields.includes(exportKey);

    return {
      key: _.toString(column.key),
      label,
      exportKey,
      selectable: isSupported,
    };
  });

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => {
    return new Set(
      columnOptions
        .filter((option) => option.selectable)
        .map((option) => option.key),
    );
  });

  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const dataSource = columnOptions.map((option) => ({
    ...option,
    selected: selectedKeys.has(option.key),
  }));

  const handleVisibilityChange = (key: string, checked: boolean) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }

      // Update form field with export keys
      const selectedExportKeys = dataSource
        .filter((item) => newSet.has(item.key))
        .map((item) => item.exportKey)
        .filter((key): key is string => key !== null);
      formRef.current?.setFieldValue('selectedExportKeys', selectedExportKeys);

      return newSet;
    });
  };

  const filteredDataSource = searchKeyword
    ? dataSource.filter((item) =>
        _.toLower(item.label).includes(_.toLower(searchKeyword)),
      )
    : dataSource;

  const tableColumns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      dataIndex: 'label',
      render: (text: string, record) => (
        <Checkbox
          checked={record.selected}
          disabled={!record.selectable}
          onChange={(e) => handleVisibilityChange(record.key, e.target.checked)}
        >
          <Typography.Text
            style={{
              color: record.selectable
                ? token.colorText
                : token.colorTextDisabled,
            }}
          >
            {text}
          </Typography.Text>
        </Checkbox>
      ),
    },
  ];

  return (
    <BAIModal
      title={t('comp:BAITable.ExportCSV')}
      centered
      width={500}
      {...modalProps}
      onCancel={() => onRequestClose?.(false)}
      footer={
        <BAIButton
          type="primary"
          action={async () => {
            const selectedExportKeys = dataSource
              .filter((item) => selectedKeys.has(item.key))
              .map((item) => item.exportKey)
              .filter((key): key is string => key !== null);
            await onExport?.(selectedExportKeys);
            onRequestClose?.(true);
          }}
        >
          {t('comp:BAITable.Export')}
        </BAIButton>
      }
    >
      <Form
        ref={formRef}
        preserve={false}
        initialValues={{
          selectedExportKeys: columnOptions
            .filter((option) => option.selectable)
            .map((option) => option.exportKey),
        }}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="searchInput"
          label={t('comp:BAITable.SelectColumnToDisplay')}
          style={{ marginBottom: token.marginSM }}
        >
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('comp:BAITable.SearchTableColumn')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Form.Item>

        <Form.Item name="selectedExportKeys" style={{ display: 'none' }}>
          <Input />
        </Form.Item>

        <Table
          rowKey="key"
          showHeader={false}
          columns={tableColumns}
          dataSource={filteredDataSource}
          pagination={false}
          size="small"
          style={{
            height: 330,
          }}
          scroll={{ x: 'max-content', y: 330 }}
        />
      </Form>
    </BAIModal>
  );
};

export default BAITableColumnCSVExportModal;
