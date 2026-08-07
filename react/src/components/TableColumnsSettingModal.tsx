/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import BAIFormItem from './BAIFormItem';
import { AstryxFormTextInput } from './astryxFormControls';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { VStack } from '@astryxdesign/core/Stack';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { BAIModal, BAIModalProps, type BAIColumnsType } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Search } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface FormValues {
  searchInput?: string;
  selectedColumnKeys?: Array<string>;
}

interface TableColumnsSettingProps extends BAIModalProps {
  open: boolean;
  onRequestClose: (formValues?: FormValues) => void;
  // Frontier note (ticket 19): typed against BUI's re-exported BAIColumnsType
  // so this shared modal no longer imports antd types directly; consumers'
  // antd `ColumnsType` values are structurally identical.
  columns: BAIColumnsType<any>;
  hiddenColumnKeys?: Array<string>;
}

interface ColumnOption {
  label?: string;
  value: string;
  isHidden?: boolean;
}

/**
 * Replacement for antd `Checkbox.Group` inside a `Form.Item` (the antd Form
 * ENGINE stays; MAPPING.md maps Checkbox.Group -> Astryx CheckboxList, but
 * the search-filter behaviour here needs options to disappear from view while
 * their checked state is preserved, so a thin controlled list of
 * `CheckboxInput`s is the simpler composition). `value`/`onChange` are
 * injected by `Form.Item`.
 */
const ColumnKeysChecklist: React.FC<{
  value?: Array<string>;
  onChange?: (value: Array<string>) => void;
  options: Array<ColumnOption>;
}> = ({ value = [], onChange, options }) => {
  'use memo';
  return (
    <VStack gap={1} align="stretch">
      {options
        .filter((option) => !option.isHidden)
        .map((option) => (
          <CheckboxInput
            key={option.value}
            label={option.label ?? option.value}
            value={_.includes(value, option.value)}
            onChange={(checked) => {
              onChange?.(
                checked
                  ? [...value, option.value]
                  : _.without(value, option.value),
              );
            }}
          />
        ))}
    </VStack>
  );
};

const TableColumnsSettingModal: React.FC<TableColumnsSettingProps> = ({
  open,
  onRequestClose,
  columns,
  hiddenColumnKeys,
  ...modalProps
}) => {
  const formRef = useRef<FormInstance>(null);
  const { t } = useTranslation();

  const onChangeTitleToString: any = (element: any) => {
    const text = React.Children.map(element.props.children, (child) => {
      if (typeof child === 'string') {
        return child;
      }
    });
    return text;
  };

  const columnOptions: Array<ColumnOption> = _.map(columns, (column) => {
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
        <BAIFormItem
          name="searchInput"
          label={t('table.SelectColumnToDisplay')}
          style={{ marginBottom: 0 }}
        >
          <AstryxFormTextInput
            label={t('table.SearchTableColumn')}
            startIcon={Search}
            placeholder={t('table.SearchTableColumn')}
          />
        </BAIFormItem>
        <BAIFormItem
          noStyle
          shouldUpdate={(prev, cur) => prev.searchInput !== cur.searchInput}
        >
          {(form) => {
            const { getFieldValue } = form as FormInstance<FormValues>;
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
                    isHidden: true,
                  },
            );
            return (
              <BAIFormItem
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
                <ColumnKeysChecklist options={filteredColumns} />
              </BAIFormItem>
            );
          }}
        </BAIFormItem>
      </Form>
    </BAIModal>
  );
};

export default TableColumnsSettingModal;
