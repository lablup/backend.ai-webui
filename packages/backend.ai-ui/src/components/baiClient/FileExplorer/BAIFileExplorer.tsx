import { BAIFileExplorerFragment$key } from '../../../__generated__/BAIFileExplorerFragment.graphql';
import {
  convertToDecimalUnit,
  filterEmptyItem,
  localeCompare,
} from '../../../helper';
import { BAITrashBinIcon } from '../../../icons';
import BAIFlex from '../../BAIFlex';
import BAILink from '../../BAILink';
import { BAITable } from '../../Table';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import ActionItems from './ActionItems';
import ControlItems from './ControlItems';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import DragAndDrop from './DragAndDrop';
import EditableName from './EditableName';
import { useSearchVFolderFiles } from './hooks';
import { FileOutlined, FolderOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, TableColumnsType, theme, Typography } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import { createContext, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export const FolderInfoContext = createContext<{
  targetVFolderId: string;
  currentPath: string;
}>({
  targetVFolderId: '',
  currentPath: '.',
});

export interface BAIFileExplorerProps {
  vfolderNodeFrgmt?: BAIFileExplorerFragment$key | null;
  targetVFolderId: string;
  onUpload: (
    files: Array<RcFile>,
    currentPath: string,
    refetch: () => void,
  ) => void;
}

const BAIFileExplorer: React.FC<BAIFileExplorerProps> = ({
  vfolderNodeFrgmt,
  targetVFolderId,
  onUpload,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isDragMode, setIsDragMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Array<VFolderFile>>([]);
  const [selectedSingleItem, setSelectedSingleItem] =
    useState<VFolderFile | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<Array<ItemType>>([
    { title: <HomeOutlined />, onClick: () => navigateToPath('.') },
  ]);
  const {
    files,
    isFetching,
    currentPath,
    navigateDown,
    navigateToPath,
    refetch,
  } = useSearchVFolderFiles(targetVFolderId);
  const [cachedFetchedFiles, setCachedFetchedFiles] = useState<
    Array<VFolderFile>
  >([]);
  const [pathFoldersCache, setPathFoldersCache] = useState<
    Record<string, Array<VFolderFile>>
  >({});

  const virtualFolderNodeFrgmt = useFragment(
    graphql`
      fragment BAIFileExplorerFragment on VirtualFolderNode {
        permission
        ...ControlItemsFragment
        ...ActionItemsFragment
        ...EditableNameFragment
      }
    `,
    vfolderNodeFrgmt,
  );

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

  useEffect(() => {
    if (files?.items) {
      const folders = files.items.filter((item) => item.type === 'DIRECTORY');
      setCachedFetchedFiles(files.items);
      setPathFoldersCache((prev) => ({ ...prev, [currentPath]: folders }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, files]);

  useEffect(() => {
    const pathParts = currentPath === '.' ? [] : currentPath.split('/');
    const items: Array<ItemType> = [
      {
        title: <HomeOutlined />,
        onClick: () => {
          navigateToPath('.');
          setSelectedItems([]);
        },
      },
    ];

    pathParts.forEach((part, index) => {
      const pathToThisPoint = pathParts.slice(0, index + 1).join('/');
      const parentPath =
        index === 0 ? '.' : pathParts.slice(0, index).join('/');
      const parentFolders = pathFoldersCache[parentPath] || [];

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
        title: part,
        onClick: () => {
          navigateToPath(pathToThisPoint);
          setSelectedItems([]);
        },
        menu: menuItems.length > 0 ? { items: menuItems } : undefined,
      });
    });

    setBreadcrumbItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, pathFoldersCache]);

  const columns: TableColumnsType<VFolderFile> = filterEmptyItem([
    {
      title: t('comp:FileExplorer.Name'),
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a.name, b.name),
      fixed: 'left',
      render: (name, record) => (
        <EditableName
          editableNameFrgmt={virtualFolderNodeFrgmt}
          fileInfo={record}
          existingFiles={cachedFetchedFiles}
          afterEdit={() => {
            refetch();
          }}
        >
          {record?.type === 'DIRECTORY' ? (
            <BAILink
              type="hover"
              onClick={() => {
                navigateDown(name);
                setSelectedItems([]);
              }}
              style={{ maxWidth: 200 }}
              icon={<FolderOutlined style={{ color: token.colorLink }} />}
              ellipsis={{ tooltip: name }}
            >
              {name}
            </BAILink>
          ) : (
            <BAIFlex gap="xs" style={{ display: 'inline-flex' }}>
              <FileOutlined />
              <Typography.Text
                ellipsis={{
                  tooltip: name,
                }}
                style={{ maxWidth: 200 }}
              >
                {name}
              </Typography.Text>
            </BAIFlex>
          )}
        </EditableName>
      ),
    },
    {
      title: t('comp:FileExplorer.Controls'),
      fixed: 'left',
      render: (_, record) => {
        return (
          <Suspense
            fallback={
              <BAIFlex gap="xs">
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadIcon color={token.colorInfo} />}
                  loading
                />
                <Button
                  type="text"
                  size="small"
                  icon={<BAITrashBinIcon style={{ color: token.colorError }} />}
                  onClick={() => {
                    setSelectedSingleItem(record);
                  }}
                  disabled={!isEditable}
                />
              </BAIFlex>
            }
          >
            <ControlItems
              controlItemsFrgmt={virtualFolderNodeFrgmt}
              selectedItem={record}
              onClickDelete={() => {
                setSelectedSingleItem(record);
              }}
            />
          </Suspense>
        );
      },
    },
    {
      title: t('comp:FileExplorer.Size'),
      dataIndex: 'size',
      sorter: (a, b) => localeCompare(a.type, b.type),
      render: (size) => {
        return size === 0
          ? null
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

  const isEditable = virtualFolderNodeFrgmt?.permission?.includes('w');

  return (
    <FolderInfoContext.Provider value={{ targetVFolderId, currentPath }}>
      {isDragMode && (
        <DragAndDrop
          onUpload={(files, currentPath) =>
            onUpload(files, currentPath, refetch)
          }
        />
      )}
      <BAIFlex
        direction="column"
        align="stretch"
        justify="start"
        gap="md"
        style={{ height: '100%' }}
      >
        <BAIFlex align="center" justify="between">
          <Breadcrumb
            items={breadcrumbItems.filter((_, index) => {
              if (index === 0) return true; // Always show home
              const currentDepth =
                currentPath === '.' ? 0 : currentPath.split('/').length;
              return index <= currentDepth;
            })}
            itemRender={(item) => (
              <Typography.Link onClick={item.onClick}>
                {item.title}
              </Typography.Link>
            )}
          />
          <ActionItems
            actionItemsFrgmt={virtualFolderNodeFrgmt}
            selectedItems={selectedItems}
            onUpload={(files, currentPath) =>
              onUpload(files, currentPath, refetch)
            }
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
          />
        </BAIFlex>

        <BAITable
          rowKey="name"
          bordered
          scroll={{ x: 'max-content' }}
          dataSource={cachedFetchedFiles}
          columns={columns}
          loading={files?.items !== cachedFetchedFiles || isFetching}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: _.map(selectedItems, 'name'),
            onChange: (selectedRowKeys) => {
              setSelectedItems(
                cachedFetchedFiles?.filter((file) =>
                  selectedRowKeys.includes(file.name),
                ) || [],
              );
            },
          }}
        />
      </BAIFlex>
      <DeleteSelectedItemsModal
        open={!!selectedSingleItem}
        selectedItems={selectedSingleItem ? [selectedSingleItem] : []}
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
    </FolderInfoContext.Provider>
  );
};

export default BAIFileExplorer;
