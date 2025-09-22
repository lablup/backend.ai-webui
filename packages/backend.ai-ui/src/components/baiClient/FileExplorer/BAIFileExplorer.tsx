import { BAIFileExplorerFragment$key } from '../../../__generated__/BAIFileExplorerFragment.graphql';
import {
  convertToDecimalUnit,
  filterOutEmpty,
  localeCompare,
} from '../../../helper';
import BAIFlex from '../../BAIFlex';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import { BAITable } from '../../Table';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import ExplorerActionControls from './ExplorerActionControls';
import FileItemControls from './FileItemControls';
import { useSearchVFolderFiles } from './hooks';
import { FileOutlined, FolderOutlined, HomeOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
  Skeleton,
  TableColumnsType,
  theme,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import _ from 'lodash';
import { createContext, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const useStyles = createStyles(({ css, token }) => ({
  hover: css`
    text-decoration: none;
    /* color: ${token.colorLink}; */

    &:hover {
      /* color: ${token.colorLinkHover}; */
      text-decoration: underline;
    }
  `,
}));

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
  onUpload: (files: Array<RcFile>, currentPath: string) => void;
}

const BAIFileExplorer: React.FC<BAIFileExplorerProps> = ({
  vfolderNodeFrgmt,
  targetVFolderId,
  onUpload,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const [selectedItems, setSelectedItems] = useState<Array<VFolderFile>>([]);
  const [selectedSingleItem, setSelectedSingleItem] =
    useState<VFolderFile | null>(null);
  const baiClient = useConnectedBAIClient();
  const isDirectorySizeVisible = baiClient?._config?.isDirectorySizeVisible;

  const {
    files,
    directoryTree,
    isFetching,
    currentPath,
    navigateDown,
    navigateToPath,
    refetch,
  } = useSearchVFolderFiles(targetVFolderId);

  const [fetchedFilesCache, setFetchedFilesCache] = useState<
    Array<VFolderFile>
  >([]);

  useEffect(() => {
    if (!_.isNil(files?.items)) {
      setFetchedFilesCache(files.items);
    }
  }, [files]);

  const vFolderNode = useFragment(
    graphql`
      fragment BAIFileExplorerFragment on VirtualFolderNode {
        ...FileItemControlsFragment
      }
    `,
    vfolderNodeFrgmt,
  );

  const breadCrumbItems: Array<ItemType> = useMemo(() => {
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
        title: part,
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
      fixed: 'left',
      render: (name, record) =>
        record?.type === 'DIRECTORY' ? (
          // FIXME: need to implement BAILink into backend.ai-ui and use it here
          <Typography.Link
            className={styles.hover}
            onClick={(e) => {
              e.stopPropagation();
              navigateDown(name);
              setSelectedItems([]);
            }}
            style={{ display: 'block', width: 'fit-content' }} // To prevent conflicts with the click event of onRow.
          >
            <BAIFlex gap="xs">
              <FolderOutlined />
              <Typography.Text
                ellipsis={{
                  tooltip: name,
                }}
                style={{ maxWidth: 200, color: token.colorLink }}
              >
                {name}
              </Typography.Text>
            </BAIFlex>
          </Typography.Link>
        ) : (
          <BAIFlex gap="xs">
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
        ),
    },
    {
      title: t('comp:FileExplorer.Controls'),
      fixed: 'left',
      render: (_, record) => {
        return (
          <Suspense fallback={<Skeleton.Button size="small" active />}>
            <FileItemControls
              vfolderNodeFrgmt={vFolderNode}
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

  return (
    <FolderInfoContext.Provider value={{ targetVFolderId, currentPath }}>
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIFlex align="center" justify="between">
          <Breadcrumb
            items={breadCrumbItems}
            itemRender={(item) => (
              <Typography.Link onClick={item.onClick}>
                {item.title}
              </Typography.Link>
            )}
          />
          <ExplorerActionControls
            selectedFiles={selectedItems}
            onUpload={(files, currentPath) => onUpload(files, currentPath)}
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
          dataSource={fetchedFilesCache}
          columns={tableColumns}
          loading={files?.items !== fetchedFilesCache || isFetching}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: _.map(selectedItems, 'name'),
            onChange: (selectedRowKeys) => {
              setSelectedItems(
                fetchedFilesCache?.filter((file) =>
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
        />
      </BAIFlex>
      <BAIUnmountAfterClose>
        <DeleteSelectedItemsModal
          open={!!selectedSingleItem}
          selectedFiles={selectedSingleItem ? [selectedSingleItem] : []}
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
