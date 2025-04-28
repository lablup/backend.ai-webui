import { useThemeMode } from '../hooks/useThemeMode';
import { useDebounce } from 'ahooks';
import { ConfigProvider, GetProps, Table, theme } from 'antd';
import { createStyles } from 'antd-style';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { TableProps } from 'antd/lib';
import classNames from 'classnames';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
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

export interface BAITableProps<RecordType extends object = any>
  extends TableProps<RecordType> {
  resizable?: boolean;
  neoStyle?: boolean;
  orderString?: string;
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
  orderString,
  ...tableProps
}: BAITableProps<RecordType>) => {
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { isDarkMode } = useThemeMode();
  const [resizedColumnWidths, setResizedColumnWidths] = useState<
    Record<string, number>
  >(generateResizedColumnWidths(columns));

  const mergedColumns = useMemo(() => {
    let processedColumns = columns;

    // Apply sort direction based on orderString
    if (orderString && columns) {
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
        const orderField = orderString.startsWith('-')
          ? orderString.substring(1)
          : orderString;

        if (dataIndex === orderField) {
          return {
            ...column,
            sortOrder: orderString.startsWith('-') ? 'descend' : 'ascend',
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
  }, [resizable, columns, resizedColumnWidths, orderString]);

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
      />
    </ConfigProvider>
  );
};

export default BAITable;
