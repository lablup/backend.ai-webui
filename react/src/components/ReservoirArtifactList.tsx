import type { ReservoirArtifact } from '../types/reservoir';
import BAIText from './BAIText';
import { CloseOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Tooltip,
  TableColumnsType,
  theme,
} from 'antd';
import { Flex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Download, Package, Container, Brain, TrashIcon } from 'lucide-react';
import React from 'react';

dayjs.extend(relativeTime);

interface ReservoirArtifactListProps {
  artifacts: ReservoirArtifact[];
  onArtifactSelect: (artifact: ReservoirArtifact) => void;
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
  onArtifactSelect,
  onPull,
  type,
  order,
  loading = false,
  rowSelection,
  pagination,
  onChangeOrder,
}) => {
  const { token } = theme.useToken();

  // const getStatusIcon = (status: ReservoirArtifact['status']) => {
  //   switch (status) {
  //     case 'verified':
  //       return <CheckCircle size={14} color={token.colorSuccess} />;
  //     case 'pulling':
  //       return <Loader size={14} color={token.colorInfo} />;
  //     case 'verifying':
  //       return <Loader size={14} color={token.colorWarning} />;
  //     case 'available':
  //       return <CloudDownload size={14} color={token.colorPrimary} />;
  //     case 'error':
  //       return <AlertCircle size={14} color={token.colorError} />;
  //     default:
  //       return null;
  //   }
  // };

  const getStatusColor = (status: ReservoirArtifact['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pulling':
        return 'processing';
      case 'verifying':
        return 'warning';
      case 'available':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: ReservoirArtifact['type']) => {
    switch (type) {
      case 'model':
        return <Brain size={16} color={getTypeColor(type)} />;
      case 'package':
        return <Package size={16} color={getTypeColor(type)} />;
      case 'image':
        return <Container size={16} color={getTypeColor(type)} />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: ReservoirArtifact['type']) => {
    switch (type) {
      case 'model':
        return 'blue';
      case 'package':
        return 'green';
      case 'image':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns: TableColumnsType<ReservoirArtifact> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ReservoirArtifact) => (
        <Flex align="center" gap="sm">
          <div>
            <Flex gap={'xs'}>
              <Button
                type="link"
                onClick={() => onArtifactSelect(record)}
                style={{
                  padding: 0,
                  height: 'auto',
                  fontWeight: 'bold',
                  fontSize: token.fontSize,
                }}
              >
                {name}
              </Button>

              <Tag
                color={getTypeColor(record.type)}
                bordered={false}
                style={
                  {
                    // fontSize: token.fontSizeSM,
                  }
                }
              >
                {getTypeIcon(record.type)} {record.type.toUpperCase()}
              </Tag>
            </Flex>
            {record.description && (
              <Typography.Text
                type="secondary"
                style={{ display: 'block', fontSize: token.fontSizeSM }}
              >
                {record.description}
              </Typography.Text>
            )}
          </div>
        </Flex>
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
        <Flex>
          <Tag
            icon={
              ['pulling', 'verifying'].includes(status) ? (
                <SyncOutlined spin />
              ) : null
            }
            color={getStatusColor(status)}
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
        </Flex>
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

  const handleTableChange = (
    paginationInfo: any,
    filters: any,
    sorter: any,
  ) => {
    if (onChangeOrder && sorter.field) {
      const order =
        sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
      onChangeOrder(order);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={artifacts}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      rowSelection={rowSelection}
      onChange={handleTableChange}
      size="middle"
      scroll={{ x: 'max-content' }}
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
