import { transformSorterToOrderString } from '../../helper';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIText from '../BAIText';
import BAIUnmountAfterClose from '../BAIUnmountAfterClose';
import { BAIConfigProvider } from '../provider';
import BAIPaginationInfoText from './BAIPaginationInfoText';
import BAITableSettingModal from './BAITableSettingModal';
import { LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { useControllableValue, useDebounce } from 'ahooks';
import {
  Button,
  Pagination,
  Table,
  type TablePaginationConfig,
  type TableProps,
} from 'antd';
import { createStyles } from 'antd-style';
import type { AnyObject, GetProps } from 'antd/es/_util/type';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Resizable, type ResizeCallbackData } from 'react-resizable';

/**
 * Configuration interface for BAITable pagination
 * Extends Ant Design's TablePaginationConfig but omits 'position' property
 */
interface BAITablePaginationConfig extends Omit<
  TablePaginationConfig,
  'position'
> {
  /** Additional content to display in the pagination area */
  extraContent?: ReactNode;
}

/**
 * Column override properties that can be customized
 * Used to override default column behavior like visibility
 */
export interface BAITableColumnOverrideItem {
  /** Override the default visibility of a column */
  hidden?: boolean;
  // Future extensibility: width?, pinned?, etc.
  // order?: number; // Override column order
}
/**
 * Record type mapping column keys to their override configurations
 */
export type BAITableColumnOverrideRecord = Record<
  string,
  BAITableColumnOverrideItem
>;

/**
 * Configuration for table settings including column overrides
 * Supports controllable column visibility and customization
 */
export interface BAITableSettings {
  /** Current column property overrides that differ from defaults (controllable) */
  columnOverrides?: Record<string, BAITableColumnOverrideItem>;
  /** Default column overrides to use initially */
  defaultColumnOverrides?: Record<string, BAITableColumnOverrideItem>;
  /** Callback function called when column overrides change */
  onColumnOverridesChange?: (
    overrides: Record<string, BAITableColumnOverrideItem>,
  ) => void;
}

/**
 * Extended column type for BAITable with additional properties
 * Extends Ant Design's ColumnType with custom BAI-specific features
 */
export interface BAIColumnType<
  RecordType = any,
> extends ColumnType<RecordType> {
  /** Whether this column should be hidden by default */
  defaultHidden?: boolean;
  /** Whether this column is required and cannot be hidden by users */
  required?: boolean;
}

export interface BAIColumnGroupType<RecordType = AnyObject> extends Omit<
  BAIColumnType<RecordType>,
  'dataIndex'
> {
  children: ColumnsType<RecordType>;
}

/**
 * Array type for BAI table columns
 */
export type BAIColumnsType<RecordType = any> = (
  | BAIColumnGroupType<RecordType>
  | BAIColumnType<RecordType>
)[];

/**
 * Utility function to determine if a column should be visible
 * Takes into account required columns, overrides, and default visibility
 *
 * @param column - The column configuration
 * @param columnKey - The unique key for the column
 * @param overrides - Column override settings
 * @returns Whether the column should be visible
 */
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

/**
 * Filters columns to return only visible ones based on overrides
 *
 * @param columns - Array of column configurations
 * @param overrides - Column override settings
 * @returns Filtered array of visible columns
 */
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

/**
 * Restores a specific column to its default settings by removing its override
 *
 * @param overrides - Current column overrides
 * @param columnKey - Key of the column to restore
 * @returns New overrides object without the specified column override
 */
export const restoreColumnToDefault = (
  overrides: Record<string, BAITableColumnOverrideItem>,
  columnKey: string,
): Record<string, BAITableColumnOverrideItem> => {
  const newOverrides = { ...overrides };
  delete newOverrides[columnKey];
  return newOverrides;
};

/**
 * Restores all columns to their default settings by clearing all overrides
 *
 * @returns Empty overrides object
 */
export const restoreAllColumnsToDefault = (): Record<
  string,
  BAITableColumnOverrideItem
> => {
  return {};
};
type BAITableBaseProps<RecordType> = Omit<TableProps<RecordType>, 'onChange'>;

/**
 * Props interface for BAITable component
 * Extends Ant Design's TableProps with additional BAI-specific features
 */
export interface BAITableProps<
  RecordType extends AnyObject,
> extends BAITableBaseProps<RecordType> {
  /** Pagination configuration or false to disable pagination */
  pagination?: false | BAITablePaginationConfig;
  /** Whether columns should be resizable */
  resizable?: boolean;
  /** Current sort order string (e.g., 'name' or '-name' for descending) */
  order?: string | null;
  /** Callback function called when sort order changes */
  onChangeOrder?: (order?: string) => void;
  /** Table settings including column visibility controls */
  tableSettings?: BAITableSettings;
  /** Array of column configurations using BAIColumnType */
  columns?: BAIColumnsType<RecordType>;
  spinnerLoading?: boolean;
}

/**
 * BAITable - Enhanced table component with column management and sorting
 *
 * A comprehensive table component that extends Ant Design's Table with:
 * - Column visibility controls with settings modal
 * - Resizable columns support
 * - Enhanced sorting with order string support
 * - Persistent column overrides
 * - Custom pagination layout
 *
 * @param props - BAITableProps configuration
 * @returns React element
 *
 * @example
 * ```tsx
 * const columns = [
 *   { title: 'Name', dataIndex: 'name', key: 'name' },
 *   { title: 'Age', dataIndex: 'age', key: 'age', defaultHidden: true }
 * ];
 *
 * <BAITable
 *   columns={columns}
 *   dataSource={data}
 *   tableSettings={{
 *     columnOverrides: {},
 *     onColumnOverridesChange: setColumnOverrides
 *   }}
 * />
 * ```
 */
const BAITable = <RecordType extends object = any>({
  resizable = false,
  columns,
  components,
  loading,
  spinnerLoading,
  order,
  onChangeOrder,
  tableSettings,
  ...tableProps
}: BAITableProps<RecordType>): React.ReactElement => {
  'use memo';
  const { t } = useTranslation();
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
                  onResize: (_e, { size }) => {
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

  const isValidPageNumber = () => {
    const total =
      (tableProps.pagination && tableProps.pagination.total) ||
      tableProps.dataSource?.length ||
      0;
    if (total === 0 && currentPage === 1) {
      // skip validation when there is no data
      return true;
    }
    const totalPages = Math.ceil(total / currentPageSize);
    return currentPage >= 1 && currentPage <= totalPages;
  };

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIConfigProvider
        renderEmpty={
          isValidPageNumber()
            ? undefined
            : () => (
                <BAIFlex
                  direction="column"
                  align="center"
                  justify="center"
                  gap={'sm'}
                >
                  <BAIText type="secondary">
                    {t('comp:BAITable.InvalidPageNumber')}
                  </BAIText>
                  <BAIButton
                    type="primary"
                    onClick={() => {
                      setCurrentPage(1);
                      tableProps.pagination &&
                        tableProps.pagination.onChange?.(1, currentPageSize);
                    }}
                  >
                    {t('comp:BAITable.GoToFirstPage')}
                  </BAIButton>
                </BAIFlex>
              )
        }
      >
        <Table
          size={tableProps.size || 'small'}
          showSorterTooltip={false}
          className={classNames(
            resizable && styles.resizableTable,
            styles.neoHeader,
            tableProps.rowSelection?.columnWidth === 0 &&
              styles.zeroWithSelectionColumn,
          )}
          loading={
            spinnerLoading
              ? {
                  indicator: <LoadingOutlined spin />,
                  spinning: true,
                }
              : undefined
          }
          style={{
            opacity: loading ? 0.6 : 1,
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
          onChange={(_pagination, _filters, sorter) => {
            if (onChangeOrder) {
              const nextOrder = transformSorterToOrderString(sorter);
              if (nextOrder !== order) {
                onChangeOrder(nextOrder);
              }
            }
          }}
          pagination={
            tableProps.pagination === false
              ? false
              : {
                  style: {
                    display: 'none', // Hide default pagination as we're using custom Pagination component below
                  },
                  current: currentPage,
                  pageSize: currentPageSize,
                }
          }
        />
      </BAIConfigProvider>
      {tableProps.pagination !== false && (
        <BAIFlex justify="end" gap={'xs'}>
          <Pagination
            size={tableProps.pagination?.size || 'small'}
            align="end"
            pageSizeOptions={['10', '20', '50']}
            showSizeChanger={true}
            showTotal={(total, range) => (
              <BAIPaginationInfoText
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
              size={tableProps.size || 'small'}
            />
          )}
          {tableProps.pagination && tableProps.pagination.extraContent}
        </BAIFlex>
      )}

      {tableSettings && (
        <BAIUnmountAfterClose>
          <BAITableSettingModal
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
    body:not(.dark-theme) & .ant-table-expanded-row > .ant-table-cell,
    body:not(.dark-theme) & .ant-table-expanded-row:hover > .ant-table-cell {
      background: #e3e3e3;
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
