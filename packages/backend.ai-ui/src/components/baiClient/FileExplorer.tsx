// import { fileListAtom } from '../../hooks/atoms';
import Flex from '../Flex';
import { useDynamicList, useUpdateEffect } from 'ahooks';
import Breadcrumb, { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import Button, { ButtonProps } from 'antd/es/button';
import { ModalProps } from 'antd/es/modal';
import Table from 'antd/es/table';
import Tooltip from 'antd/es/tooltip';
import dayjs from 'dayjs';
// import { useAtomValue } from 'jotai';
import _ from 'lodash';
import { FileIcon, FolderIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends ModalProps {
  defaultSelectedKeys?: React.Key[];
  folderName?: string;
  initialPath?: string;
  onRequestClose: (selectedVFolders?: VirtualFolder[]) => void;
  filter?: (folder: VirtualFolder) => boolean;
}

const FileExplorer: React.FC<Props> = ({
  onRequestClose,
  defaultSelectedKeys,
  folderName,
  initialPath = '.',
  filter,
  ...props
}) => {
  // Using i18next translation for backward compatibility
  const { t } = useTranslation('components/FolderExplorer');

  // Using our new locale and translation hook from Backend.AI Provider
  // This is an example of how to use our new hooks
  // import { useBackendAITranslation, useLocale } from '../bai-provider';
  // const locale = useLocale();
  // const translate = (key: string) => useBackendAITranslation(key, 'components/FolderExplorer');

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

  const [
    ,
    // isPending
    startTransition,
  ] = useTransition();
  // const fileList = useAtomValue(
  //   fileListAtom({
  //     path: encodeURIComponent(path.join('/')),
  //     vFolderName: folderName || '',
  //   }),
  // );
  const fileList: Array<FileMetadata> = [];

  const [
    ,
    // selectedRowKeys
    setSelectedRowKeys,
  ] = useState<React.Key[]>(defaultSelectedKeys || []);

  useUpdateEffect(() => {
    setSelectedRowKeys(defaultSelectedKeys || []);
  }, [defaultSelectedKeys]);

  const items: BreadcrumbItemType[] = _.map(path, (p, i) => {
    return i === 0
      ? {
          title: <FolderIcon style={{ cursor: 'pointer' }} />,
          onClick(e: React.MouseEvent) {
            e.preventDefault();
            pathMutationInTransition.resetList(['.']);
          },
          href: '#',
        }
      : {
          title: p,
          onClick(e: React.MouseEvent) {
            e.preventDefault();
            pathMutationInTransition.resetList(path.slice(0, i + 1));
          },
          href: i !== path.length - 1 ? '#' : undefined,
        };
  });

  return (
    <>
      {/* <span>{selectedRowKeys.length} folder selected</span> */}
      <Flex gap={'xs'}>
        <Breadcrumb separator=">" items={items} />
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
            title: t('components.folder-explorer.column.Name'),
            dataIndex: 'name',
            align: 'left',
            render: (text, record) => {
              return (
                <Flex direction="row">
                  {record.type === 'DIRECTORY' ? (
                    <Button
                      type="link"
                      style={{ padding: 2 }}
                      icon={<FolderIcon />}
                      onClick={(e) => {
                        e.preventDefault();
                        pathMutationInTransition.push(text);
                      }}
                    >
                      {text}
                    </Button>
                  ) : (
                    <>
                      <FileIcon style={{ margin: 5 }} />
                      {text}
                    </>
                  )}
                </Flex>
              );
            },
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: t('components.folder-explorer.column.Created'),
            dataIndex: 'created',
            render: (text) => dayjs(text).format('lll'),
            ellipsis: true,
            sorter: (a, b) => dayjs(a.created).diff(b.created),
          },
          {
            title: t('components.folder-explorer.column.Type'),
            dataIndex: 'type',
            render: (text) => (text === 'DIRECTORY' ? 'Folder' : 'File'),
            sorter: (a, b) => a.type.localeCompare(b.type),
          },
          {
            title: t('components.folder-explorer.column.Modified'),
            dataIndex: 'modified',
            render: (text) => dayjs(text).format('lll'),
            ellipsis: true,
            sorter: (a, b) => dayjs(a.modified).diff(b.modified),
          },
          {
            title: t('components.folder-explorer.column.Size'),
            dataIndex: 'size',
            align: 'right',
            sorter: (a, b) => dayjs(a.size).diff(b.size),
            // render: (text) => {
          },
          {
            title: t('components.folder-explorer.column.Actions'),
            dataIndex: 'actions',
            render: (text, record) => {
              return (
                <Tooltip title="Download">
                  {folderName ? (
                    // <FolderDownloadButton
                    //   folderName={folderName}
                    //   path={path.join('/') + `/${record.name}`}
                    //   archive={record.type === 'DIRECTORY'}
                    // />
                    <Button>FolderDownload TODO</Button>
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
    </>
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
        // icon={<FolderOutlined />}
        {...props}
        onClick={(e) => {
          setVisible(true);
        }}
      />
      <FileExplorer
        folderName={folderName}
        initialPath={initialPath}
        open={visible}
        onRequestClose={() => {
          setVisible(false);
        }}
      />
    </>
  );
};

export default FileExplorer;

export interface VirtualFolder {
  name: string;
  id: string;
  host: string;
  quota_scope_id: string;
  status: VirtualFolderOperationStatus;
  numFiles?: number; // legacy
  num_files: number;
  used_bytes: number;
  usage_mode: string; // "data"
  created: string;
  created_at: string;
  last_used: string;
  is_owner: boolean;
  permission: string;
  user: string;
  group: string | null; // "None"
  creator: string;
  user_email: string;
  group_name: string | null;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: string | null;
  cur_size: number;
}

// ref: https://github.com/lablup/backend.ai/blob/8d31486ce09d7f952aa5cab59e8391f0522b65dc/src/ai/backend/manager/models/vfolder.py#L162-L176
type VirtualFolderOperationStatus =
  | 'ready'
  | 'performing'
  | 'cloning'
  | 'mounted'
  | 'error'
  //
  | 'delete-pending' // VFolder is in trash bin
  | 'delete-ongoing' // VFolder is being deleted in storage
  | 'delete-complete' // VFolder is deleted permanently, only DB row remains
  | 'delete-error';
type FileMetadata = {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  size: number;
  mode: string; // oct
  created: string;
  modified: string;
};
