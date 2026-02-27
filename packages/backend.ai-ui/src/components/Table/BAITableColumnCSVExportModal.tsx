import BAIButton from '../BAIButton';
import BAIModal, { BAIModalProps } from '../BAIModal';
import { BAIColumnsType } from './BAITable';
import { SearchOutlined } from '@ant-design/icons';
import { Input, theme, Form, Table, Checkbox, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BAITableColumnCSVExportModalProps<T = unknown> extends BAIModalProps {
  onRequestClose?: (success: boolean) => void;
  onExport: (selectedExportKeys: string[]) => Promise<void>;
  supportedFields: string[];
  columns: BAIColumnsType<T>;
}

const BAITableColumnCSVExportModal = <T,>({
  onRequestClose,
  onExport,
  supportedFields,
  columns,
  ...modalProps
}: BAITableColumnCSVExportModalProps<T>): React.JSX.Element => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const extractTitleString = (element: React.ReactElement): string => {
    const { children } = element.props as { children?: React.ReactNode };
    return React.Children.toArray(children)
      .filter((child) => typeof child === 'string')
      .join('');
  };

  const columnOptions = _.map(columns, (column) => {
    let label: string;
    if (typeof column.title === 'string') {
      label = column.title;
    } else if (typeof column.title === 'object' && 'props' in column.title!) {
      label = extractTitleString(column.title);
    } else {
      label = '';
    }

    // Get export keys (exportKey > dataIndex > empty)
    let exportKeys: string[] = [];
    if (column.exportKey) {
      exportKeys = Array.isArray(column.exportKey)
        ? column.exportKey
        : [column.exportKey];
    } else if ('children' in column) {
      // Column groups without explicit exportKey have no export keys
    } else if (column.dataIndex) {
      exportKeys = [
        Array.isArray(column.dataIndex)
          ? column.dataIndex.join('.')
          : _.toString(column.dataIndex),
      ];
    }

    // Check if all export keys are supported
    const isSupported =
      exportKeys.length > 0 &&
      exportKeys.every((k) => supportedFields.includes(k));

    return {
      key: _.toString(column.key),
      label,
      exportKeys,
      selectable: isSupported,
    };
  });

  // Build group map: columns sharing the same export keys are controlled together
  const exportKeyGroupMap = new Map<string, string[]>();
  columnOptions.forEach((option) => {
    if (option.exportKeys.length > 0 && option.selectable) {
      const groupId = [...option.exportKeys].sort().join(',');
      if (!exportKeyGroupMap.has(groupId)) {
        exportKeyGroupMap.set(groupId, []);
      }
      exportKeyGroupMap.get(groupId)!.push(option.key);
    }
  });

  const getGroupMembers = (key: string): string[] => {
    const option = columnOptions.find((o) => o.key === key);
    if (!option || option.exportKeys.length === 0) return [key];
    const groupId = [...option.exportKeys].sort().join(',');
    return exportKeyGroupMap.get(groupId) || [key];
  };

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
    const groupMembers = getGroupMembers(key);
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      groupMembers.forEach((memberKey) => {
        if (checked) {
          newSet.add(memberKey);
        } else {
          newSet.delete(memberKey);
        }
      });
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
            const selectedExportKeys = _.uniq(
              dataSource
                .filter((item) => selectedKeys.has(item.key))
                .flatMap((item) => item.exportKeys),
            );
            await onExport?.(selectedExportKeys);
            onRequestClose?.(true);
          }}
        >
          {t('comp:BAITable.Export')}
        </BAIButton>
      }
    >
      <Form preserve={false} layout="vertical" requiredMark={false}>
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
