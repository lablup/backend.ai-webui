import type { ReservoirArtifact } from '../types/reservoir';
import {
  getStatusColor,
  getStatusIcon,
  getTypeColor,
  getTypeIcon,
} from '../utils/reservoir';
import BAIText from './BAIText';
import {
  Button,
  Tag,
  Typography,
  Tooltip,
  TableColumnsType,
  theme,
} from 'antd';
import { BAIFlex, BAITable } from 'backend.ai-ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Download } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

interface ReservoirArtifactListProps {
  artifacts: ReservoirArtifact[];
  onPull: (artifactId: string, version?: string) => void;
  type: 'all' | 'installed' | 'available';
  order?: string;
  loading?: boolean;
  rowSelection?: {
    type: 'checkbox';
    preserveSelectedRowKeys?: boolean;
    getCheckboxProps?: (record: ReservoirArtifact) => { disabled: boolean };
    onChange?: (selectedRowKeys: React.Key[]) => void;
    selectedRowKeys?: React.Key[];
  };
  pagination?: {
    pageSize: number;
    current: number;
    total: number;
    showTotal?: (total: number) => React.ReactNode;
    onChange?: (current: number, pageSize: number) => void;
  };
  onChangeOrder?: (order: string) => void;
}

const ReservoirArtifactList: React.FC<ReservoirArtifactListProps> = ({
  artifacts,
  onPull,
  type,
  order,
  loading = false,
  rowSelection,
  pagination,
  onChangeOrder,
}) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const columns: TableColumnsType<ReservoirArtifact> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ReservoirArtifact) => (
        <BAIFlex align="center" gap="sm">
          <div>
            <BAIFlex gap={'xs'}>
              <Link
                to={'/reservoir/' + record.id}
                style={{
                  fontWeight: 'bold',
                  fontSize: token.fontSize,
                }}
              >
                {name}
              </Link>

              <Tag
                color={getTypeColor(record.type)}
                bordered={false}
                style={
                  {
                    // fontSize: token.fontSizeSM,
                  }
                }
              >
                {getTypeIcon(record.type, 14)} {record.type.toUpperCase()}
              </Tag>
            </BAIFlex>
            {record.description && (
              <Typography.Text
                type="secondary"
                style={{ display: 'block', fontSize: token.fontSizeSM }}
              >
                {record.description}
              </Typography.Text>
            )}
          </div>
        </BAIFlex>
      ),
      sorter: onChangeOrder ? true : false,
      // sortOrder:
      //   order === 'name' ? 'ascend' : order === '-name' ? 'descend' : false,
      // width: '35%',
    },
    // {
    //   title: 'Controls',
    //   key: 'controls',
    //   render: (_, record: ReservoirArtifact) => (
    //     <Flex gap={'xxs'}>
    //       <>
    //         <Button icon={<TrashIcon />} size="small" />
    //         <Tooltip title="Pull Latest Version">
    //           <Button
    //             icon={<Download size={16} />}
    //             onClick={() => onPull(record.id)}
    //             size="small"
    //             // @ts-ignore
    //             loading={record.status === 'pulling'}
    //           />
    //         </Tooltip>
    //       </>
    //     </Flex>
    //   ),
    //   // width: '10%',
    // },
    // {
    //   title: 'Type',
    //   dataIndex: 'type',
    //   key: 'type',
    //   render: (type: ReservoirArtifact['type']) => (
    //     <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
    //   ),
    //   width: '10%',
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReservoirArtifact['status'], record) => (
        // <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
        <BAIFlex>
          <Tag
            icon={getStatusIcon(status)}
            color={getStatusColor(status)}
            style={
              status === 'available'
                ? {
                    borderStyle: 'dashed',
                    backgroundColor: token.colorBgContainer,
                  }
                : undefined
            }
          >
            {status.toUpperCase()}
          </Tag>
          {status === 'available' && (
            <Tooltip title="Pull Latest Version">
              <Button
                icon={<Download size={16} />}
                onClick={() => onPull(record.id)}
                size="small"
                // @ts-ignore
                loading={record.status === 'pulling'}
              />
            </Tooltip>
          )}
        </BAIFlex>
      ),
      // width: '12%',
    },
    {
      title: 'Latest Version',
      dataIndex: 'versions',
      key: 'latest_version',
      render: (versions: string[]) => {
        const latestVersion =
          versions && versions.length > 0 ? versions[0] : 'N/A';
        return <BAIText monospace>{latestVersion}</BAIText>;
      },
      // width: '12%',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: string) => <BAIText monospace>{size}</BAIText>,
      sorter: onChangeOrder ? true : false,
      // sortOrder:
      //   order === 'size' ? 'ascend' : order === '-size' ? 'descend' : false,
      // width: '10%',
    },

    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (updated_at: string) => (
        <Typography.Text type="secondary">
          {dayjs(updated_at).fromNow()}
        </Typography.Text>
      ),
      sorter: onChangeOrder ? true : false,
      // sortOrder:
      //   order === 'updated_at'
      //     ? 'ascend'
      //     : order === '-updated_at'
      //       ? 'descend'
      //       : false,
      // width: '13%',
    },
  ];

  // const handleTableChange = (
  //   paginationInfo: any,
  //   filters: any,
  //   sorter: any,
  // ) => {
  //   if (onChangeOrder && sorter.field) {
  //     const order =
  //       sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
  //     onChangeOrder(order);
  //   }
  // };

  return (
    <BAITable
      resizable
      columns={columns}
      dataSource={artifacts}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      rowSelection={rowSelection}
      size="small"
      scroll={{ x: 'max-content' }}
      onRow={(record) => ({
        onClick: (event) => {
          // Don't trigger row click if clicking on a button or link
          const target = event.target as HTMLElement;
          const isClickableElement = target.closest('button, a, .ant-btn');
          if (!isClickableElement) {
            navigate('/reservoir/' + record.id);
          }
        },
        style: { cursor: 'pointer' },
      })}
      // expandable={{
      //   expandedRowRender: (record) => (
      //     <div style={{ padding: '16px 0' }}>
      //       <Flex direction="column" gap="sm">
      //         {record.source && (
      //           <div>
      //             <Typography.Text strong>Source: </Typography.Text>
      //             <Typography.Text>{record.source}</Typography.Text>
      //           </div>
      //         )}
      //         {record.versions.length > 0 && (
      //           <div>
      //             <Typography.Text strong>Available Versions: </Typography.Text>
      //             <Space wrap>
      //               {record.versions.map((version) => (
      //                 <Tag key={version}>{version}</Tag>
      //               ))}
      //             </Space>
      //           </div>
      //         )}
      //         {record.status === 'pulling' && (
      //           <div>
      //             <Typography.Text strong>Progress: </Typography.Text>
      //             <Progress
      //               percent={Math.floor(Math.random() * 100)}
      //               size="small"
      //               status="active"
      //             />
      //           </div>
      //         )}
      //       </Flex>
      //     </div>
      //   ),
      //   expandRowByClick: true,
      // }}
    />
  );
};

export default ReservoirArtifactList;
