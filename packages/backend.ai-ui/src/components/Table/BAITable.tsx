import { transformSorterToOrderString } from '../../helper';
import BAIFlex from '../BAIFlex';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import PaginationInfoText from './PaginationInfoText';
import TableSettingModal from './TableSettingModal';
import { SettingOutlined } from '@ant-design/icons';
import { useControllableValue, useDebounce } from 'ahooks';
import {
  Button,
  Pagination,
  Table,
  TablePaginationConfig,
  TableProps,
} from 'antd';
import { createStyles } from 'antd-style';
import { AnyObject, GetProps } from 'antd/es/_util/type';
import { ColumnType, ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import _ from 'lodash';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';

interface BAITablePaginationConfig
  extends Omit<TablePaginationConfig, 'position'> {
  extraContent?: ReactNode;
}

// Column override properties that can be customized
export interface BAITableColumnOverrideItem {
  hidden?: boolean; // Override defaultHidden
  // Future extensibility: width?, pinned?, etc.
  // order?: number; // Override column order
}
export type BAITableColumnOverrideRecord = Record<
  string,
  BAITableColumnOverrideItem
>;

export interface BAITableSettings {
  // Store column property overrides that differ from defaults (controllable)
  columnOverrides?: Record<string, BAITableColumnOverrideItem>;
  defaultColumnOverrides?: Record<string, BAITableColumnOverrideItem>;
  onColumnOverridesChange?: (
    overrides: Record<string, BAITableColumnOverrideItem>,
  ) => void;
}

export interface BAIColumnType<RecordType = any>
  extends ColumnType<RecordType> {
  defaultHidden?: boolean;
  required?: boolean; // Prevent user from hiding this column
}

export type BAIColumnsType<RecordType = any> = BAIColumnType<RecordType>[];

// Utility functions for column overrides management
export const isColumnVisible = (
  column: BAIColumnType<any>,
  columnKey: string,
  overrides?: Record<string, BAITableColumnOverrideItem>,
): boolean => {
  // Required columns are always visible
  if (column.required) {
    return true;
  }

  // Use hidden value from overrides if exists, otherwise use default value (!defaultHidden)
  const override = overrides?.[columnKey];
  return override?.hidden !== undefined
    ? !override.hidden
    : !column.defaultHidden;
};

export const getVisibleColumns = (
  columns: BAIColumnsType,
  overrides?: Record<string, BAITableColumnOverrideItem>,
): BAIColumnsType => {
  return columns.filter((col) => {
    const key = col.key?.toString();
    if (!key) return true;
    return isColumnVisible(col, key, overrides);
  });
};

export const restoreColumnToDefault = (
  overrides: Record<string, BAITableColumnOverrideItem>,
  columnKey: string,
): Record<string, BAITableColumnOverrideItem> => {
  const newOverrides = { ...overrides };
  delete newOverrides[columnKey];
  return newOverrides;
};

export const restoreAllColumnsToDefault = (): Record<
  string,
  BAITableColumnOverrideItem
> => {
  return {};
};
type BAITableBaseProps<RecordType> = Omit<TableProps<RecordType>, 'onChange'>;

export interface BAITableProps<RecordType extends AnyObject>
  extends BAITableBaseProps<RecordType> {
  // customized
  pagination?: false | BAITablePaginationConfig;
  // new
  resizable?: boolean;
  order?: string;
  onChangeOrder?: (order?: string) => void;
  tableSettings?: BAITableSettings;
  // Override columns to use BAIColumnType
  columns?: BAIColumnsType<RecordType>;
}

const BAITable = <RecordType extends object = any>({
  resizable = false,
  columns,
  components,
  loading,
  order,
  onChangeOrder,
  tableSettings,
  ...tableProps
}: BAITableProps<RecordType>): React.ReactElement => {
  const { styles } = useStyles();
  const [resizedColumnWidths, setResizedColumnWidths] = useState<
    Record<string, number>
  >(generateResizedColumnWidths(columns));
  const [columnOverrides, setColumnOverrides] = useControllableValue(
    tableSettings || {},
    {
      valuePropName: 'columnOverrides',
      defaultValuePropName: 'defaultColumnOverrides',
      trigger: 'onColumnOverridesChange',
      defaultValue: {},
    },
  );
  const [isColumnSettingModalOpen, setIsColumnSettingModalOpen] =
    useState(false);
  const [currentPage, setCurrentPage] = useControllableValue(
    tableProps.pagination ? tableProps.pagination : {},
    {
      valuePropName: 'current',
      defaultValue: 1,
      trigger: 'no-trigger',
    },
  );
  const [currentPageSize, setCurrentPageSize] = useControllableValue(
    tableProps.pagination ? tableProps.pagination : {},
    {
      valuePropName: 'pageSize',
      defaultValue: 10,
      trigger: 'no-trigger',
    },
  );

  const mergedColumns = useMemo(() => {
    let processedColumns = columns;

    // Filter hidden columns based on overrides
    if (tableSettings) {
      processedColumns = columns?.filter((column) => {
        const columnKey = column.key?.toString();
        if (!columnKey) return true;
        return isColumnVisible(column, columnKey, columnOverrides);
      });
    }

    // Apply sort direction based on orderString
    if (order && processedColumns) {
      processedColumns = processedColumns.map((column) => {
        // Skip column groups (with children) or columns without dataIndex
        if ('children' in column || !column.dataIndex || !column.sorter) {
          return column;
        }

        const dataIndex = Array.isArray(column.dataIndex)
          ? column.dataIndex.join('.')
          : column.dataIndex.toString();

        // Check if this column matches the field in orderString
        // Remove the "-" prefix if present to compare the field name
        const orderField = order.startsWith('-') ? order.substring(1) : order;

        if (dataIndex === orderField) {
          return {
            ...column,
            sortOrder: order.startsWith('-') ? 'descend' : 'ascend',
          };
        }

        return column;
      });
    }

    return !resizable
      ? processedColumns
      : _.map(
          processedColumns,
          (column, index) =>
            ({
              ...column,
              width:
                resizedColumnWidths[columnKeyOrIndexKey(column, index)] ||
                column.width,
              onHeaderCell: (column: ColumnType<RecordType>) => {
                return {
                  width: column.width,
                  onResize: (e, { size }) => {
                    setResizedColumnWidths((prev) => ({
                      ...prev,
                      [columnKeyOrIndexKey(column, index)]: size.width,
                    }));
                  },
                } as GetProps<typeof ResizableTitle>;
              },
            }) as ColumnType<RecordType>,
        );
  }, [
    resizable,
    columns,
    resizedColumnWidths,
    order,
    tableSettings,
    columnOverrides,
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <Table
        size={tableProps.size || 'small'}
        showSorterTooltip={false}
        className={classNames(
          resizable && styles.resizableTable,
          styles.neoHeader,
          tableProps.rowSelection?.columnWidth === 0 &&
            styles.zeroWithSelectionColumn,
        )}
        style={{
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
        }}
        components={
          resizable
            ? _.merge(components || {}, {
                header: {
                  cell: ResizableTitle,
                },
              })
            : components
        }
        columns={mergedColumns}
        {...tableProps}
        onChange={(pagination, filters, sorter) => {
          if (onChangeOrder) {
            const nextOrder = transformSorterToOrderString(sorter);
            if (nextOrder !== order) {
              onChangeOrder(nextOrder);
            }
          }
        }}
        pagination={{
          style: {
            display: 'none', // Hide default pagination as we're using custom Pagination component below
          },
          current: currentPage,
          pageSize: currentPageSize,
        }}
      />
      {tableProps.pagination !== false && (
        <BAIFlex justify="end" gap={'xs'}>
          <Pagination
            size={tableProps.size === 'small' ? 'small' : 'default'}
            align="end"
            pageSizeOptions={['10', '20', '50']}
            showSizeChanger={true}
            showTotal={(total, range) => (
              <PaginationInfoText
                start={range[0]}
                end={range[1]}
                total={total}
              />
            )}
            {...tableProps.pagination}
            // override props for controlled values
            total={
              tableProps.pagination?.total || tableProps.dataSource?.length || 0
            }
            onChange={(page, pageSize) => {
              setCurrentPage(page);
              setCurrentPageSize(pageSize);
              if (tableProps.pagination) {
                tableProps.pagination.onChange?.(page, pageSize);
              }
            }}
            current={currentPage}
            pageSize={currentPageSize}
          ></Pagination>
          {tableSettings && (
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setIsColumnSettingModalOpen(true)}
              size={tableProps.size}
            />
          )}
          {tableProps.pagination && tableProps.pagination.extraContent}
        </BAIFlex>
      )}

      {tableSettings && (
        <BAIUnmountAfterClose>
          <TableSettingModal
            open={isColumnSettingModalOpen}
            onRequestClose={(formValues) => {
              setIsColumnSettingModalOpen(false);
              if (formValues) {
                const selectedKeys = formValues.selectedColumnKeys || [];
                const newOverrides: Record<string, BAITableColumnOverrideItem> =
                  {};

                // Only store in overrides when different from default values
                columns?.forEach((col) => {
                  const key = col.key?.toString();
                  if (key) {
                    const shouldBeVisible = selectedKeys.includes(key);
                    const defaultVisible = !col.defaultHidden;

                    // Only store when different from default
                    if (shouldBeVisible !== defaultVisible) {
                      newOverrides[key] = { hidden: !shouldBeVisible };
                    }
                  }
                });

                setColumnOverrides(newOverrides);
              }
            }}
            columns={columns || []}
            columnOverrides={columnOverrides}
            disableSorter
          />
        </BAIUnmountAfterClose>
      )}
    </BAIFlex>
  );
};

export default BAITable;

const useStyles = createStyles(({ token, css }) => ({
  resizableTable: css`
    .react-resizable-handle {
      position: absolute;
      inset-inline-end: 0px;
      bottom: 0;
      z-index: 1;
      width: 10px;
      height: 100%;
      cursor: col-resize;
    }
    .ant-table-cell {
      overflow: hidden;
      white-space: 'pre';
      word-wrap: 'break-word';
    }
  `,
  neoHeader: css`
    thead.ant-table-thead > tr > th.ant-table-cell {
      font-weight: 500;
      color: ${token.colorTextTertiary};
    }
  `,
  zeroWithSelectionColumn: css`
    .ant-table-selection-column {
      /* display: none !important; */
      padding: 0 !important;
    }
  `,
}));

const ResizableTitle = (
  props: React.HTMLAttributes<any> & {
    onResize: (
      e: React.SyntheticEvent<Element> | undefined,
      data: ResizeCallbackData,
    ) => void;
    width: number;
  },
) => {
  const { onResize, width, onClick, ...restProps } = props;
  const wrapRef = useRef<HTMLTableCellElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const debouncedIsResizing = useDebounce(isResizing, { wait: 100 });

  // This is a workaround for the initial width of resizable columns if the width is not specified
  useEffect(() => {
    if (wrapRef.current && _.isUndefined(width)) {
      onResize?.(undefined, {
        size: {
          width: wrapRef.current.offsetWidth,
          height: wrapRef.current.offsetHeight,
        },
        node: wrapRef.current,
        handle: 'e',
      });
    }
  });

  return _.isUndefined(width) ? (
    <th ref={wrapRef} {...restProps} />
  ) : (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      onResizeStart={() => {
        setIsResizing(true);
      }}
      onResizeStop={() => {
        setIsResizing(false);
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th
        onClick={(e) => {
          if (debouncedIsResizing) {
            e.preventDefault();
          } else {
            onClick?.(e);
          }
        }}
        {...restProps}
      />
    </Resizable>
  );
};

const columnKeyOrIndexKey = (column: any, index: number) =>
  column.key || `index_${index}`;

const generateResizedColumnWidths = (columns?: ColumnsType<any>) => {
  const widths: Record<string, number> = {};
  _.each(columns, (column, index) => {
    widths[columnKeyOrIndexKey(column, index)] = column.width as number;
  });
  return widths;
};
