// import { filesState, VirtualFolder } from "../../hooks/backendai";
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import Flex from './Flex';
import FolderDownloadButton from './FolderDownloadButton';
import { VFolder } from './VFolderSelect';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { useDynamicList, useUpdateEffect } from 'ahooks';
import { Breadcrumb, Button, Modal, ModalProps, Table, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';

interface FileItem {
  name: string;
  type: string;
  size: number;
  mode: string;
  created: string;
  modified: string;
}

interface Props extends ModalProps {
  defaultSelectedKeys?: React.Key[];
  folderName?: string;
  initialPath?: string;
  onRequestClose: (selectedVFolders?: VFolder[]) => void;
  filter?: (folder: VFolder) => boolean;
}

const FolderExplorer: React.FC<Props> = ({
  onRequestClose,
  defaultSelectedKeys,
  folderName,
  initialPath = '.',
  filter,
  ...props
}) => {
  const { list: path, ...orgPathActions } = useDynamicList(
    initialPath.split('/'),
  );

  const pathMutationInTransition: Pick<
    typeof orgPathActions,
    'resetList' | 'push' | 'pop'
  > = {
    resetList: (newList) => {
      startTransition(() => {
        orgPathActions.resetList(newList);
      });
    },
    push: (newItem) => {
      startTransition(() => {
        orgPathActions.push(newItem);
      });
    },
    pop: () => {
      startTransition(() => {
        orgPathActions.pop();
      });
    },
  };

  const [, startTransition] = useTransition();
  // const fileList = useRecoilValue(
  //   filesState({
  //     path: encodeURIComponent(path.join("/")),
  //     vFolderName: folderName || "",
  //   })
  // );

  const baiClient = useSuspendedBackendaiClient();

  const { data: fileList } = useSuspenseTanQuery<Array<FileItem>>({
    queryKey: ['FolderExplorer', folderName, path.join('/')],
    queryFn: () => {
      if (!props.open || !folderName) {
        return [];
      }
      return baiClient.vfolder
        .list_files(path.join('/'), folderName)
        .then((res: any) => {
          // if (res.status === 404) {
          //   return null;
          // }
          return res.items;
        });
    },
  });

  const [, setSelectedRowKeys] = useState<React.Key[]>(
    defaultSelectedKeys || [],
  );

  useUpdateEffect(() => {
    setSelectedRowKeys(defaultSelectedKeys || []);
  }, [defaultSelectedKeys]);

  return (
    <Modal
      {...props}
      footer={null}
      width={'80%'}
      destroyOnClose
      onCancel={() => {
        onRequestClose();
      }}
      title={<span>{folderName}</span>}
    >
      {/* <span>{selectedRowKeys.length} folder selected</span> */}
      <Flex>
        <Breadcrumb separator=">">
          {_.map(path, (p, i) => {
            return i === 0 ? (
              <Breadcrumb.Item
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  pathMutationInTransition.resetList(['.']);
                }}
                href="#"
              >
                <FolderOutlined style={{ cursor: 'pointer' }} />
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  pathMutationInTransition.resetList(path.slice(0, i + 1));
                }}
                {...(i !== path.length - 1 && { href: '#' })}
              >
                {p}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
        {/* <WhiteSpace direction="row" />
        <Text
          copyable={{
            text: path.join("/"),
            tooltips: 'Copy "path" to clipboard',
          }}
        /> */}
      </Flex>
      <Table
        // size="small"
        rowKey={(record) => record.name}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: (selectedRowKeys) => {
        //     setSelectedRowKeys(selectedRowKeys);
        //   },
        // }}
        showSorterTooltip={false}
        pagination={false}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            align: 'left',
            render: (text, record) => {
              return (
                <Flex direction="row">
                  {record.type === 'DIRECTORY' ? (
                    <Button
                      type="link"
                      style={{ padding: 2 }}
                      icon={<FolderOutlined />}
                      onClick={(e) => {
                        e.preventDefault();
                        pathMutationInTransition.push(text);
                      }}
                    >
                      {text}
                    </Button>
                  ) : (
                    <>
                      <FileOutlined style={{ margin: 5 }} />
                      {text}
                    </>
                  )}
                </Flex>
              );
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: 'Created',
            dataIndex: 'created',
            render: (text) => dayjs(text).format('lll'),
            ellipsis: true,
            sorter: (a, b) => dayjs(a.created).diff(b.created),
          },
          {
            title: 'Type',
            dataIndex: 'type',
            render: (text) => (text === 'DIRECTORY' ? 'Folder' : 'File'),
            sorter: (a, b) => a.type.localeCompare(b.type),
          },
          {
            title: 'Modified',
            dataIndex: 'modified',
            render: (text) => dayjs(text).format('lll'),
            ellipsis: true,
            sorter: (a, b) => dayjs(a.modified).diff(b.modified),
          },
          {
            title: 'Size',
            dataIndex: 'size',
            align: 'right',
            sorter: (a, b) => a.size - b.size,
            // render: (text) => {
          },
          {
            title: 'Actions',
            dataIndex: 'actions',
            render: (text, record) => {
              return (
                <Tooltip title="Download">
                  {folderName ? (
                    <FolderDownloadButton
                      folderName={folderName}
                      path={path.join('/') + `/${record.name}`}
                      archive={record.type === 'DIRECTORY'}
                    />
                  ) : null}
                </Tooltip>
              );
            },
          },
        ]}
        dataSource={fileList}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              event.stopPropagation();
              // console.log(selectedRowKeys);
              // selectedRowKeys.includes(record.name)
              //   ? setSelectedRowKeys(
              //       selectedRowKeys.filter((k) => k !== record.name)
              //     )
              //   : setSelectedRowKeys([record.name]);
              // // : setSelectedRowKeys([...selectedRowKeys, record.name]);
            },
            // onDoubleClick: (event) => {
            //   event.stopPropagation();
            //   if (record.type === "DIRECTORY") {
            //     pathMutationInTransition.push(record.name);
            //   }
            // },
          };
        }}
      />
    </Modal>
  );
};

interface FolderExplorerButtonProps extends ButtonProps {
  folderName?: string;
  initialPath?: string;
}

export const FolderExplorerButton: React.FC<FolderExplorerButtonProps> = ({
  folderName,
  initialPath,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button
        type="link"
        style={{ padding: 0 }}
        icon={<FolderOutlined />}
        {...props}
        onClick={(e) => {
          setVisible(true);
        }}
      />
      <FolderExplorer
        folderName={folderName || ''}
        initialPath={initialPath}
        open={visible}
        onRequestClose={() => {
          setVisible(false);
        }}
      />
    </>
  );
};

export default FolderExplorer;
