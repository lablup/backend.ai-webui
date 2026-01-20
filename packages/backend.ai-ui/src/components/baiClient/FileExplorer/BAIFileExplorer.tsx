import {
  convertToDecimalUnit,
  filterOutEmpty,
  localeCompare,
} from '../../../helper';
import BAIFetchKeyButton from '../../BAIFetchKeyButton';
import BAIFlex from '../../BAIFlex';
import BAILink from '../../BAILink';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import { BAITable, BAITableProps } from '../../Table';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import DragAndDrop from './DragAndDrop';
import EditableFileName from './EditableFileName';
import ExplorerActionControls from './ExplorerActionControls';
import FileItemControls from './FileItemControls';
import { useSearchVFolderFiles } from './hooks';
import { FolderOutlined } from '@ant-design/icons';
import { Breadcrumb, Skeleton, TableColumnsType, theme } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import _ from 'lodash';
import { HouseIcon } from 'lucide-react';
import {
  createContext,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

export const FolderInfoContext = createContext<{
  targetVFolderId: string;
  currentPath: string;
}>({
  targetVFolderId: '',
  currentPath: '.',
});

export interface BAIFileExplorerRef {
  refetch: () => void;
}

export interface BAIFileExplorerProps {
  targetVFolderId: string;
  fetchKey?: string;
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
  tableProps?: Partial<BAITableProps<VFolderFile>>;
  style?: React.CSSProperties;
  fileDropContainerRef?: React.RefObject<HTMLDivElement | null>;
  enableDownload?: boolean;
  enableDelete?: boolean;
  enableWrite?: boolean;
  enableEdit?: boolean;
  onChangeFetchKey?: (fetchKey: string) => void;
  ref?: React.Ref<BAIFileExplorerRef>;
  onDeleteFilesInBackground?: (
    bgTaskId: string,
    targetVFolderId: string,
    deletingFilePaths: Array<string>,
  ) => void;
  // FIXME: need to delete when `delete-file-async` API returns deleting file paths
  deletingFilePaths?: Array<string>;
  onClickEditFile?: (file: VFolderFile, currentPath: string) => void;
}

const BAIFileExplorer: React.FC<BAIFileExplorerProps> = ({
  targetVFolderId,
  fetchKey,
  onUpload,
  tableProps,
  fileDropContainerRef,
  enableDownload = false,
  enableDelete = false,
  enableWrite = false,
  enableEdit = false,
  onDeleteFilesInBackground,
  deletingFilePaths,
  onClickEditFile,
  style,
  ref,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Array<VFolderFile>>([]);
  const [selectedSingleItem, setSelectedSingleItem] =
    useState<VFolderFile | null>(null);
  const baiClient = useConnectedBAIClient();
  const isDirectorySizeVisible = baiClient?._config?.isDirectorySizeVisible;

  const {
    files,
    directoryTree,
    isFetching,
    isLoading: isFirstFetching,
    currentPath,
    navigateDown,
    navigateToPath,
    refetch,
  } = useSearchVFolderFiles(targetVFolderId, fetchKey);

  useImperativeHandle(
    ref,
    () => ({
      refetch,
    }),
    [refetch],
  );

  const breadCrumbItems: Array<ItemType> = useMemo(() => {
    const pathParts = currentPath === '.' ? [] : currentPath.split('/');

    const items: Array<ItemType> = [
      {
        title: (
          <BAILink style={{ color: 'inherit' }}>
            <HouseIcon />
          </BAILink>
        ),
        onClick: () => {
          navigateToPath('.');
          setSelectedItems([]);
        },
      },
    ];

    _.forEach(pathParts, (part, index) => {
      const navigatePath = pathParts.slice(0, index + 1).join('/');
      const parentPath =
        index === 0 ? '.' : pathParts.slice(0, index).join('/');
      const parentFolders =
        directoryTree[parentPath]?.filter(
          (item) => item.type === 'DIRECTORY',
        ) || [];

      const menuItems = parentFolders.map((dir) => ({
        key: dir.name,
        label: (
          <BAIFlex
            align="center"
            gap="xxs"
            onClick={() => {
              const newPath =
                parentPath === '.' ? dir.name : `${parentPath}/${dir.name}`;
              navigateToPath(newPath);
              setSelectedItems([]);
            }}
          >
            <FolderOutlined />
            {dir.name}
          </BAIFlex>
        ),
      }));

      items.push({
        title: <BAILink style={{ color: 'inherit' }}>{part}</BAILink>,
        onClick: () => {
          navigateToPath(navigatePath);
          setSelectedItems([]);
        },
        menu: menuItems.length > 1 ? { items: menuItems } : undefined,
      });
    });

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, directoryTree]);

  const tableColumns: TableColumnsType<VFolderFile> = filterOutEmpty([
    {
      title: t('comp:FileExplorer.Name'),
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a.name, b.name),
      render: (name, record) => (
        <EditableFileName
          fileInfo={record}
          existingFiles={files?.items || []}
          disabled={!enableWrite}
          onEndEdit={() => {
            refetch();
          }}
          onClick={(e) => {
            e.stopPropagation();
            const targetEl = e.target as HTMLElement;
            if (targetEl.closest('button')) return;
            if (record.type === 'DIRECTORY') {
              navigateDown(name);
              setSelectedItems([]);
            }
          }}
        />
      ),
    },
    {
      title: t('comp:FileExplorer.Controls'),
      width: 80,
      render: (_controls, record) => {
        // true if the file is being deleted or its parent directory is being deleted
        const isPendingDelete =
          _.includes(deletingFilePaths, `${currentPath}/${record.name}`) ||
          _.some(deletingFilePaths, (path) =>
            _.startsWith(
              currentPath,
              _.endsWith(path, '/') ? path : `${path}/`,
            ),
          );

        return (
          <Suspense fallback={<Skeleton.Button size="small" active />}>
            <FileItemControls
              selectedItem={record}
              onClickDelete={() => {
                setSelectedSingleItem(record);
              }}
              onClickEdit={() => onClickEditFile?.(record, currentPath)}
              enableDownload={enableDownload}
              enableDelete={enableDelete}
              enableEdit={enableEdit}
              deleteButtonProps={{ loading: isPendingDelete }}
            />
          </Suspense>
        );
      },
    },
    {
      title: t('comp:FileExplorer.Size'),
      dataIndex: 'size',
      sorter: (a, b) => localeCompare(a.type, b.type),
      render: (size, record) => {
        if (record.type === 'DIRECTORY' && !isDirectorySizeVisible) {
          return '-';
        }
        return size === 0
          ? '-'
          : convertToDecimalUnit(size, 'auto')?.displayValue;
      },
    },
    {
      title: t('comp:FileExplorer.CreatedAt'),
      dataIndex: 'created',
      sorter: (a, b) => localeCompare(a.created, b.created),
      render: (createdAt) => dayjs(createdAt).format('lll'),
    },
    {
      title: t('comp:FileExplorer.ModifiedAt'),
      dataIndex: 'modified',
      sorter: (a, b) => localeCompare(a.modified, b.modified),
      render: (modifiedAt) => dayjs(modifiedAt).format('lll'),
    },
  ]);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setIsDragMode(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (!e.relatedTarget || !document.contains(e.relatedTarget as Node)) {
        setIsDragMode(false);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragMode(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <FolderInfoContext.Provider value={{ targetVFolderId, currentPath }}>
      {isDragMode && (
        <DragAndDrop
          portalContainer={fileDropContainerRef?.current || undefined}
          onUpload={(files, currentPath) => onUpload(files, currentPath)}
        />
      )}
      <BAIFlex
        direction="column"
        align="stretch"
        justify="start"
        gap="md"
        style={{ height: '100%', ...style }}
      >
        <BAIFlex align="center" justify="between">
          <Breadcrumb
            items={breadCrumbItems}
            style={{
              marginLeft: token.marginXXS,
            }}
          />
          <ExplorerActionControls
            selectedFiles={selectedItems}
            enableDelete={enableDelete}
            enableWrite={enableWrite}
            onUpload={(files, currentPath) => onUpload(files, currentPath)}
            onDeleteFilesInBackground={onDeleteFilesInBackground}
            onRequestClose={(
              success: boolean,
              modifiedItems?: Array<VFolderFile>,
            ) => {
              if (success) {
                modifiedItems &&
                  setSelectedItems((prev) =>
                    _.filter(
                      prev,
                      (item: VFolderFile) =>
                        !_.includes(
                          _.map(
                            modifiedItems,
                            (modifiedItem) => modifiedItem.name,
                          ),
                          item.name,
                        ),
                    ),
                  );
                refetch();
              }
            }}
            extra={
              <BAIFetchKeyButton
                loading={isFetching}
                value={'_not_used_key_'}
                onChange={() => {
                  refetch();
                }}
              />
            }
          />
        </BAIFlex>

        <BAITable
          rowKey="name"
          scroll={{ x: 'max-content' }}
          dataSource={files?.items}
          columns={tableColumns}
          // If no files have been loaded yet (including cache), show spinner loading
          spinnerLoading={isFirstFetching}
          // If files have been loaded before, use normal loading style (opacity)
          loading={!isFirstFetching && isFetching}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: _.map(selectedItems, 'name'),
            onChange: (selectedRowKeys) => {
              setSelectedItems(
                files?.items?.filter((file) =>
                  selectedRowKeys.includes(file.name),
                ) || [],
              );
            },
          }}
          onRow={(record) => ({
            onClick: () => {
              const isSelected = selectedItems.some(
                (item) => item.name === record.name,
              );
              if (isSelected) {
                setSelectedItems(
                  selectedItems?.filter((item) => item.name !== record.name),
                );
              } else {
                setSelectedItems([...selectedItems, record]);
              }
            },
          })}
          {...tableProps}
        />
      </BAIFlex>
      <BAIUnmountAfterClose>
        <DeleteSelectedItemsModal
          open={!!selectedSingleItem}
          selectedFiles={selectedSingleItem ? [selectedSingleItem] : []}
          onDeleteFilesInBackground={onDeleteFilesInBackground}
          onRequestClose={(success: boolean) => {
            if (success) {
              setSelectedItems((prev) =>
                prev.filter((item) => item.name !== selectedSingleItem?.name),
              );
              refetch();
            }
            setSelectedSingleItem(null);
          }}
        />
      </BAIUnmountAfterClose>
    </FolderInfoContext.Provider>
  );
};

export default BAIFileExplorer;
