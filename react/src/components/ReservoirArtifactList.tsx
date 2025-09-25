// import BAILink from './BAILink';
// import BAITag from './BAITag';
// import BAIText from './BAIText';
// import {
//   Button,
//   TableColumnsType,
//   Tag,
//   theme,
//   Tooltip,
//   Typography,
// } from 'antd';
// import {
//   BAIFlex,
//   BAITable,
//   BAITableProps,
//   convertToDecimalUnit,
//   filterOutEmpty,
// } from 'backend.ai-ui';
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import _ from 'lodash';
// import { Download } from 'lucide-react';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { graphql, useFragment } from 'react-relay';
// import { useNavigate } from 'react-router-dom';
// import {
//   ReservoirArtifactList_artifactGroups$data,
//   ReservoirArtifactList_artifactGroups$key,
// } from 'src/__generated__/ReservoirArtifactList_artifactGroups.graphql';
// import {
//   getStatusColor,
//   getStatusIcon,
//   getTypeIcon,
// } from 'src/utils/reservoir';

// dayjs.extend(relativeTime);

// export type ArtifactGroups = NonNullable<
//   ReservoirArtifactList_artifactGroups$data[number]
// >;

// interface ReservoirArtifactListProps
//   extends Omit<BAITableProps<ArtifactGroups>, 'dataSource' | 'columns'> {
//   type: 'all' | 'installed' | 'available';
//   artifactGroupsFrgmt: ReservoirArtifactList_artifactGroups$key;
//   onClickPull: (artifactId: string) => void;
// }

// const ReservoirArtifactList: React.FC<ReservoirArtifactListProps> = ({
//   artifactGroupsFrgmt,
//   onClickPull,
//   ...tableProps
// }) => {
//   const { token } = theme.useToken();
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   const artifactGroups = useFragment(
//     graphql`
//       fragment ReservoirArtifactList_artifactGroups on ArtifactGroup
//       @relay(plural: true) {
//         id
//         name
//         type
//         description
//         status
//         lastUpdated: artifacts(
//           first: 1
//           orderBy: [{ field: UPDATED_AT, direction: DESC }]
//         ) {
//           edges {
//             node {
//               updatedAt
//             }
//           }
//         }
//         latestVersion: artifacts(
//           first: 1
//           orderBy: [{ field: LATEST_VERSION, direction: DESC }]
//         ) {
//           edges {
//             node {
//               id
//               version
//               updatedAt
//               size
//             }
//           }
//         }
//       }
//     `,
//     artifactGroupsFrgmt,
//   );

//   const columns: TableColumnsType<ArtifactGroups> = [
//     {
//       title: t('reservoirPage.Name'),
//       dataIndex: 'name',
//       key: 'name',
//       render: (name: string, record: ArtifactGroups) => (
//         <BAIFlex direction="column" align="start">
//           <BAIFlex gap={'xs'}>
//             <BAILink to={'/reservoir/' + record.id}>{name}</BAILink>
//             <Tag>
//               {getTypeIcon(record.type, 14)}&nbsp;{record.type.toUpperCase()}
//             </Tag>
//           </BAIFlex>
//           {record.description && (
//             <Typography.Text
//               type="secondary"
//               style={{ display: 'block', fontSize: token.fontSizeSM }}
//             >
//               {record.description}
//             </Typography.Text>
//           )}
//         </BAIFlex>
//       ),
//     },
//     {
//       title: t('reservoirPage.Status'),
//       dataIndex: 'status',
//       key: 'status',
//       render: (status: string, record: ArtifactGroups) => (
//         <BAIFlex>
//           <BAITag
//             icon={getStatusIcon(status)}
//             color={getStatusColor(status)}
//             style={
//               status === 'AVAILABLE'
//                 ? {
//                     borderStyle: 'dashed',
//                     backgroundColor: token.colorBgContainer,
//                   }
//                 : undefined
//             }
//           >
//             {status.toUpperCase()}
//           </BAITag>
//           {status === 'AVAILABLE' && (
//             <Tooltip title="Pull Latest Version">
//               <Button
//                 icon={<Download size={16} />}
//                 onClick={() =>
//                   onClickPull(record.latestVersion?.edges[0].node.id)
//                 }
//                 size="small"
//               />
//             </Tooltip>
//           )}
//         </BAIFlex>
//       ),
//     },
//     {
//       title: t('reservoirPage.LatestVersion'),
//       key: 'latest_version',
//       render: (_value, record: ArtifactGroups) => {
//         const latestVersion = record.latestVersion?.edges[0]?.node;

//         if (!latestVersion || _.isEmpty(latestVersion))
//           return <BAIText monospace>N/A</BAIText>;

//         return <BAIText monospace>{latestVersion.version}</BAIText>;
//       },
//     },
//     {
//       title: t('reservoirPage.Size'),
//       key: 'size',
//       render: (_value, record: ArtifactGroups) => {
//         const latestVersion = record.latestVersion?.edges[0]?.node;

//         if (!latestVersion || _.isEmpty(latestVersion))
//           return <BAIText monospace>N/A</BAIText>;

//         return (
//           <BAIText monospace>
//             {convertToDecimalUnit(latestVersion.size, 'auto')?.displayValue}
//           </BAIText>
//         );
//       },
//     },
//     {
//       title: t('reservoirPage.Updated'),
//       key: 'updated_at',
//       render: (_value, record: ArtifactGroups) => {
//         const lastUpdated = record.lastUpdated?.edges[0]?.node;

//         if (!lastUpdated || _.isEmpty(lastUpdated))
//           return <Typography.Text type="secondary">N/A</Typography.Text>;

//         return (
//           <Typography.Text
//             type="secondary"
//             title={dayjs(lastUpdated.updatedAt).toString()}
//           >
//             {dayjs(lastUpdated.updatedAt).fromNow()}
//           </Typography.Text>
//         );
//       },
//     },
//   ];

//   // const columns: TableColumnsType<ReservoirArtifact> = [
//   //   {
//   //     title: 'Name',
//   //     dataIndex: 'name',
//   //     key: 'name',
//   //     render: (name: string, record: ReservoirArtifact) => (
//   //       <BAIFlex align="center" gap="sm">
//   //         <div>
//   //           <BAIFlex gap={'xs'}>
//   //             <Link
//   //               to={'/reservoir/' + record.id}
//   //               style={{
//   //                 fontWeight: 'bold',
//   //                 fontSize: token.fontSize,
//   //               }}
//   //             >
//   //               {name}
//   //             </Link>

//   //             <Tag
//   //               color={getTypeColor(record.type)}
//   //               bordered={false}
//   //               style={
//   //                 {
//   //                   // fontSize: token.fontSizeSM,
//   //                 }
//   //               }
//   //             >
//   //               {getTypeIcon(record.type, 14)} {record.type.toUpperCase()}
//   //             </Tag>
//   //           </BAIFlex>
//   //           {record.description && (
//   //             <Typography.Text
//   //               type="secondary"
//   //               style={{ display: 'block', fontSize: token.fontSizeSM }}
//   //             >
//   //               {record.description}
//   //             </Typography.Text>
//   //           )}
//   //         </div>
//   //       </BAIFlex>
//   //     ),
//   //     sorter: onChangeOrder ? true : false,
//   //     // sortOrder:
//   //     //   order === 'name' ? 'ascend' : order === '-name' ? 'descend' : false,
//   //     // width: '35%',
//   //   },
//   //   // {
//   //   //   title: 'Controls',
//   //   //   key: 'controls',
//   //   //   render: (_, record: ReservoirArtifact) => (
//   //   //     <Flex gap={'xxs'}>
//   //   //       <>
//   //   //         <Button icon={<TrashIcon />} size="small" />
//   //   //         <Tooltip title="Pull Latest Version">
//   //   //           <Button
//   //   //             icon={<Download size={16} />}
//   //   //             onClick={() => onPull(record.id)}
//   //   //             size="small"
//   //   //             // @ts-ignore
//   //   //             loading={record.status === 'pulling'}
//   //   //           />
//   //   //         </Tooltip>
//   //   //       </>
//   //   //     </Flex>
//   //   //   ),
//   //   //   // width: '10%',
//   //   // },
//   //   // {
//   //   //   title: 'Type',
//   //   //   dataIndex: 'type',
//   //   //   key: 'type',
//   //   //   render: (type: ReservoirArtifact['type']) => (
//   //   //     <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
//   //   //   ),
//   //   //   width: '10%',
//   //   // },
//   //   {
//   //     title: 'Status',
//   //     dataIndex: 'status',
//   //     key: 'status',
//   //     render: (status: ReservoirArtifact['status'], record) => (
//   //       // <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
//   // <BAIFlex>
//   //   <Tag
//   //     icon={getStatusIcon(status)}
//   //     color={getStatusColor(status)}
//   //     style={
//   //       status === 'available'
//   //         ? {
//   //             borderStyle: 'dashed',
//   //             backgroundColor: token.colorBgContainer,
//   //           }
//   //         : undefined
//   //     }
//   //   >
//   //     {status.toUpperCase()}
//   //   </Tag>
//   //   {status === 'available' && (
//   //     <Tooltip title="Pull Latest Version">
//   //       <Button
//   //         icon={<Download size={16} />}
//   //         onClick={() => onPull(record.id)}
//   //         size="small"
//   //         // @ts-ignore
//   //         loading={record.status === 'pulling'}
//   //       />
//   //     </Tooltip>
//   //   )}
//   // </BAIFlex>
//   //     ),
//   //     // width: '12%',
//   //   },
//   // {
//   //   title: 'Latest Version',
//   //   dataIndex: 'versions',
//   //   key: 'latest_version',
//   //   render: (versions: string[]) => {
//   //     const latestVersion =
//   //       versions && versions.length > 0 ? versions[0] : 'N/A';
//   //     return <BAIText monospace>{latestVersion}</BAIText>;
//   //   },
//   //   // width: '12%',
//   // },
//   // {
//   //   title: 'Size',
//   //   dataIndex: 'size',
//   //   key: 'size',
//   //   render: (size: string) => <BAIText monospace>{size}</BAIText>,
//   //   sorter: onChangeOrder ? true : false,
//   //   // sortOrder:
//   //   //   order === 'size' ? 'ascend' : order === '-size' ? 'descend' : false,
//   //   // width: '10%',
//   // },

//   // {
//   //   title: 'Updated',
//   //   dataIndex: 'updated_at',
//   //   key: 'updated_at',
//   //   render: (updated_at: string) => (
//   //     <Typography.Text type="secondary">
//   //       {dayjs(updated_at).fromNow()}
//   //     </Typography.Text>
//   //   ),
//   //   sorter: onChangeOrder ? true : false,
//   //   // sortOrder:
//   //   //   order === 'updated_at'
//   //   //     ? 'ascend'
//   //   //     : order === '-updated_at'
//   //   //       ? 'descend'
//   //   //       : false,
//   //   // width: '13%',
//   // },
//   // ];

//   // const handleTableChange = (
//   //   paginationInfo: any,
//   //   filters: any,
//   //   sorter: any,
//   // ) => {
//   //   if (onChangeOrder && sorter.field) {
//   //     const order =
//   //       sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`;
//   //     onChangeOrder(order);
//   //   }
//   // };

//   return (
//     <BAITable<ArtifactGroups>
//       resizable
//       columns={filterOutEmpty(columns)}
//       dataSource={artifactGroups}
//       rowKey="id"
//       scroll={{ x: 'max-content' }}
//       onRow={(record) => ({
//         onClick: (event) => {
//           // Don't trigger row click if clicking on a button or link
//           const target = event.target as HTMLElement;
//           const isClickableElement = target.closest('button, a, .ant-btn');
//           if (!isClickableElement) {
//             navigate('/reservoir/' + record.id);
//           }
//         },
//         style: { cursor: 'pointer' },
//       })}
//       {...tableProps}

//       // expandable={{
//       //   expandedRowRender: (record) => (
//       //     <div style={{ padding: '16px 0' }}>
//       //       <Flex direction="column" gap="sm">
//       //         {record.source && (
//       //           <div>
//       //             <Typography.Text strong>Source: </Typography.Text>
//       //             <Typography.Text>{record.source}</Typography.Text>
//       //           </div>
//       //         )}
//       //         {record.versions.length > 0 && (
//       //           <div>
//       //             <Typography.Text strong>Available Versions: </Typography.Text>
//       //             <Space wrap>
//       //               {record.versions.map((version) => (
//       //                 <Tag key={version}>{version}</Tag>
//       //               ))}
//       //             </Space>
//       //           </div>
//       //         )}
//       //         {record.status === 'pulling' && (
//       //           <div>
//       //             <Typography.Text strong>Progress: </Typography.Text>
//       //             <Progress
//       //               percent={Math.floor(Math.random() * 100)}
//       //               size="small"
//       //               status="active"
//       //             />
//       //           </div>
//       //         )}
//       //       </Flex>
//       //     </div>
//       //   ),
//       //   expandRowByClick: true,
//       // }}
//     />
//   );
// };

// export default ReservoirArtifactList;
