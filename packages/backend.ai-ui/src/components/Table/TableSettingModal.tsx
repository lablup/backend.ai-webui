import {
  BAIColumnsType,
  isColumnVisible,
  BAITableColumnOverrideItem,
} from './BAITable';
import { SearchOutlined, HolderOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Input,
  theme,
  Form,
  Modal,
  ModalProps,
  Table,
  Checkbox,
  Typography,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { FormInstance } from 'antd/lib';
import _ from 'lodash';
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';

interface FormValues {
  searchInput?: string;
  selectedColumnKeys?: Array<string>;
  columnOrder?: Array<string>;
}

interface ColumnDataType {
  key: string;
  label: string;
  visible: boolean;
  required: boolean;
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface TableSettingProps extends ModalProps {
  open: boolean;
  onRequestClose: (formValues?: FormValues) => void;
  columns: BAIColumnsType<any>;
  columnOverrides: Record<string, BAITableColumnOverrideItem>;
  disableSorter?: boolean;
  initialColumnOrder?: string[];
}

const RowContext = React.createContext<RowContextProps>({});

const DragHandle: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  const { token } = theme.useToken();
  return (
    <Typography.Text
      style={{
        cursor: disabled ? 'not-allowed' : 'move',
        color: disabled ? token.colorTextDisabled : token.colorText,
      }}
      ref={disabled ? undefined : setActivatorNodeRef}
      {...(disabled ? {} : listeners)}
    >
      <HolderOutlined />
    </Typography.Text>
  );
};

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row: React.FC<RowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props['data-row-key'] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

const TableSettingModal: React.FC<TableSettingProps> = ({
  open,
  onRequestClose,
  columns,
  columnOverrides,
  initialColumnOrder,
  disableSorter,
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

  const columnOptions = useMemo(() => {
    return _.map(columns, (column) => {
      let label: string;
      if (typeof column.title === 'string') {
        label = column.title;
      } else if (typeof column.title === 'object' && 'props' in column.title!) {
        label = onChangeTitleToString(column.title);
      } else {
        label = '';
      }

      const key = _.toString(column.key);
      const visible = column
        ? isColumnVisible(column, key, columnOverrides)
        : true;
      const required = column?.required || false;

      return {
        key,
        label,
        visible,
        required,
      };
    });
  }, [columns, columnOverrides]);

  const [dataSource, setDataSource] = useState<ColumnDataType[]>(() => {
    if (initialColumnOrder) {
      const orderedOptions = [...columnOptions];
      orderedOptions.sort((a, b) => {
        const indexA = initialColumnOrder.indexOf(a.key);
        const indexB = initialColumnOrder.indexOf(b.key);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      return orderedOptions;
    }
    return columnOptions;
  });

  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    if (initialColumnOrder) {
      const orderedOptions = [...columnOptions];
      orderedOptions.sort((a, b) => {
        const indexA = initialColumnOrder.indexOf(a.key);
        const indexB = initialColumnOrder.indexOf(b.key);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setDataSource(orderedOptions);
    } else {
      setDataSource(columnOptions);
    }
  }, [columnOptions, initialColumnOrder]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDataSource((prevState) => {
        const activeIndex = prevState.findIndex(
          (record) => record.key === active.id,
        );
        const overIndex = prevState.findIndex(
          (record) => record.key === over.id,
        );
        const newOrder = arrayMove(prevState, activeIndex, overIndex);

        // Update form field with new order
        formRef.current?.setFieldValue(
          'columnOrder',
          newOrder.map((item) => item.key),
        );

        return newOrder;
      });
    }
  }, []);

  const handleVisibilityChange = useCallback(
    (key: string, checked: boolean) => {
      setDataSource((prevState) => {
        const newState = prevState.map((item) => {
          // Don't change visibility for required columns
          if (item.required) {
            return item;
          }
          return item.key === key ? { ...item, visible: checked } : item;
        });

        // Update form field with selected column keys
        const selectedKeys = newState
          .filter((item) => item.visible)
          .map((item) => item.key);
        formRef.current?.setFieldValue('selectedColumnKeys', selectedKeys);

        return newState;
      });
    },
    [],
  );

  const filteredDataSource = useMemo(() => {
    if (!searchKeyword) return dataSource;
    return dataSource.filter((item) =>
      _.toLower(item.label).includes(_.toLower(searchKeyword)),
    );
  }, [dataSource, searchKeyword]);

  const tableColumns: TableColumnsType<ColumnDataType> = [
    {
      key: 'sort',
      align: 'left',
      width: 30,
      hidden: disableSorter,
      render: () => <DragHandle disabled={!!searchKeyword} />,
    },
    {
      dataIndex: 'label',
      render: (text: string, record: ColumnDataType) => (
        <Checkbox
          checked={record.visible}
          disabled={record.required}
          onChange={(e) => handleVisibilityChange(record.key, e.target.checked)}
        >
          <Typography.Text
            style={{
              // Keep the text color consistent with the checkbox
              color: token.colorText,
            }}
          >
            {text}
          </Typography.Text>
        </Checkbox>
      ),
    },
  ];

  return (
    <Modal
      title={t('comp:BAITable.SettingTable')}
      open={open}
      destroyOnClose
      centered
      width={500}
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            // Ensure all required columns are included in selectedColumnKeys
            const visibleColumns = dataSource.filter((item) => item.visible);
            const requiredColumns = dataSource
              .filter((item) => item.required)
              .map((item) => item.key);

            const selectedKeys = [
              ...new Set([
                ...visibleColumns.map((item) => item.key),
                ...requiredColumns,
              ]),
            ];

            const formValues: FormValues = {
              ...values,
              selectedColumnKeys: selectedKeys,
              columnOrder: dataSource.map((item) => item.key),
            };
            onRequestClose(formValues);
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
          selectedColumnKeys: columnOptions
            .filter((option) => option.visible)
            .map((option) => option.key),
          columnOrder:
            initialColumnOrder || columnOptions.map((option) => option.key),
        }}
        layout="vertical"
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

        <Form.Item name="selectedColumnKeys" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name="columnOrder" style={{ display: 'none' }}>
          <Input />
        </Form.Item>

        <DndContext
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={searchKeyword ? undefined : handleDragEnd}
        >
          <SortableContext
            items={filteredDataSource.map((i) => i.key)}
            strategy={verticalListSortingStrategy}
          >
            <Table<ColumnDataType>
              rowKey="key"
              showHeader={false}
              components={{ body: { row: Row } }}
              columns={tableColumns}
              dataSource={filteredDataSource}
              pagination={false}
              size="small"
              style={{
                height: 330,
              }}
              scroll={{ x: 'max-content' }}
            />
          </SortableContext>
        </DndContext>
      </Form>
    </Modal>
  );
};

export default TableSettingModal;
