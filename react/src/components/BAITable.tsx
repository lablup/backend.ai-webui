import { transformSorterToOrderString } from '../helper';
import { useThemeMode } from '../hooks/useThemeMode';
import Flex from './Flex';
import PaginationInfoText from './PaginationInfoText';
import { useControllableValue, useDebounce } from 'ahooks';
import { ConfigProvider, GetProps, Pagination, Table, theme } from 'antd';
import { createStyles } from 'antd-style';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { TablePaginationConfig, TableProps } from 'antd/lib';
import classNames from 'classnames';
import _ from 'lodash';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';

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
      whitespace: 'pre';
      wordwrap: 'break-word';
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

interface BAITablePaginationConfig
  extends Omit<TablePaginationConfig, 'position'> {
  extraContent?: ReactNode;
}
type BAITableBaseProps<RecordType> = Omit<TableProps<RecordType>, 'onChange'>;

export interface BAITableProps<RecordType extends AnyObject>
  extends BAITableBaseProps<RecordType> {
  // customized
  pagination?: false | BAITablePaginationConfig;
  // new
  resizable?: boolean;
  neoStyle?: boolean;
  order?: string;
  onChangeOrder?: (order?: string) => void;
}

const columnKeyOrIndexKey = (column: any, index: number) =>
  column.key || `index_${index}`;
const generateResizedColumnWidths = (columns?: ColumnsType<any>) => {
  const widths: Record<string, number> = {};
  _.each(columns, (column, index) => {
    widths[columnKeyOrIndexKey(column, index)] = column.width as number;
  });
  return widths;
};

const BAITable = <RecordType extends object = any>({
  resizable = false,
  columns,
  components,
  neoStyle,
  loading,
  order,
  onChangeOrder,
  ...tableProps
}: BAITableProps<RecordType>) => {
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const [resizedColumnWidths, setResizedColumnWidths] = useState<
    Record<string, number>
  >(generateResizedColumnWidths(columns));
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

    // Apply sort direction based on orderString
    if (order && columns) {
      processedColumns = columns.map((column) => {
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
  }, [resizable, columns, resizedColumnWidths, order]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Table:
            !isDarkMode && neoStyle
              ? {
                  headerBg: '#E3E3E3',
                  headerSplitColor: token.colorTextQuaternary,
                  // headerSplitColor: token.colorTextQuaternary
                }
              : undefined,
        },
      }}
    >
      <Flex direction="column" align="stretch" gap={'sm'}>
        <Table
          showSorterTooltip={false}
          className={classNames(
            resizable && styles.resizableTable,
            neoStyle && styles.neoHeader,
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
          <Flex justify="end" gap={'xs'}>
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
                tableProps.pagination?.total ||
                tableProps.dataSource?.length ||
                0
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
            {tableProps.pagination && tableProps.pagination.extraContent}
          </Flex>
        )}
      </Flex>
    </ConfigProvider>
  );
};

export default BAITable;
