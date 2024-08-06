import { Table } from 'antd';
import { createStyles } from 'antd-style';
import { ColumnsType } from 'antd/es/table';
import { TableProps } from 'antd/lib';
import _ from 'lodash';
import { useMemo, useState } from 'react';
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
}));

const ResizableTitle = (
  props: React.HTMLAttributes<any> & {
    onResize: (
      e: React.SyntheticEvent<Element>,
      data: ResizeCallbackData,
    ) => void;
    width: number;
  },
) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
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
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

interface BAITableProps extends Omit<TableProps, 'columns'> {
  resizable?: boolean;
  columns: ColumnsType<any>;
}

const BAITable: React.FC<BAITableProps> = ({
  resizable = false,
  columns,
  ...tableProps
}) => {
  const { styles } = useStyles();
  const [tableColumns, setTableColumns] = useState<ColumnsType<any>>(
    columns || [],
  );

  useMemo(() => {
    if (!resizable) {
      setTableColumns(columns);
      return;
    }

    const resizableColumns = _.map(columns, (col, index) => ({
      ...col,
      onHeaderCell: (column: ColumnsType[number]) => {
        return {
          width: column.width,
          onResize: handleResize(index) as React.ReactEventHandler<any>,
        };
      },
    }));

    const handleResize =
      (index: number) =>
      (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
        const newColumns = [...resizableColumns];
        newColumns[index] = {
          ...newColumns[index],
          width: size.width,
          onHeaderCell: (column: ColumnsType[number]) => {
            return {
              width: column.width,
              onResize: handleResize(index) as React.ReactEventHandler<any>,
            };
          },
        };
        setTableColumns(newColumns);
      };

    setTableColumns(resizableColumns);
  }, [resizable, columns]);

  return (
    <>
      <Table
        className={resizable ? styles.resizableTable : ''}
        components={
          resizable
            ? {
                header: {
                  cell: ResizableTitle,
                },
              }
            : undefined
        }
        columns={tableColumns}
        {...tableProps}
      />
    </>
  );
};

export default BAITable;
