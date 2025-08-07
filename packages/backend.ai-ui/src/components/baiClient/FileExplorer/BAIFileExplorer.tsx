import { BAIFileExplorerFragment$key } from '../../../__generated__/BAIFileExplorerFragment.graphql';
import {
  convertToDecimalUnit,
  filterEmptyItem,
  localeCompare,
} from '../../../helper';
import { BAITrashBinIcon } from '../../../icons';
import BAIFlex from '../../BAIFlex';
import { BAITable } from '../../Table';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import ActionItems from './ActionItems';
import ControlItems from './ControlItems';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import { useSearchVFolderFiles } from './hooks';
import { FileOutlined, FolderOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, TableColumnsType, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import { createContext, Suspense, useEffect, useState } from 'react';
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
  const { styles } = useStyles();
  const [selectedItems, setSelectedItems] = useState<Array<VFolderFile>>([]);
  const [selectedSingleItem, setSelectedSingleItem] =
    useState<VFolderFile | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<Array<ItemType>>([
    { title: <HomeOutlined />, onClick: () => navigateToPath('.') },
  ]);
  const [pathFoldersCache, setPathFoldersCache] = useState<
    Record<string, Array<VFolderFile>>
  >({});
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

  useEffect(() => {
    if (!_.isNil(files?.items)) {
      setCachedFetchedFiles(files.items);
    }
  }, [files]);

  const FileExplorerFragment = useFragment(
    graphql`
      fragment BAIFileExplorerFragment on VirtualFolderNode {
        ...ControlItemsFragment
      }
    `,
    vfolderNodeFrgmt,
  );

  useEffect(() => {
    if (files?.items) {
      const folders = files.items.filter((item) => item.type === 'DIRECTORY');
      setPathFoldersCache((prev) => ({ ...prev, [currentPath]: folders }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, files]);

  useEffect(() => {
    const pathParts = currentPath === '.' ? [] : currentPath.split('/');
    const items: Array<ItemType> = [
      {
        title: <HomeOutlined />,
        href: '',
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
        href: '',
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
      render: (name, record) =>
        record?.type === 'DIRECTORY' ? (
          // FIXME: need to implement BAILink into backend.ai-ui and use it here
          <Typography.Link
            className={styles.hover}
            onClick={() => {
              navigateDown(name);
              setSelectedItems([]);
            }}
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
                />
              </BAIFlex>
            }
          >
            <ControlItems
              ControlItemsFrgmt={FileExplorerFragment}
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

  return (
    <FolderInfoContext.Provider value={{ targetVFolderId, currentPath }}>
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIFlex align="center" justify="between">
          <Breadcrumb
            items={breadcrumbItems.filter((_, index) => {
              if (index === 0) return true; // Always show home
              const currentDepth =
                currentPath === '.' ? 0 : currentPath.split('/').length;
              return index <= currentDepth;
            })}
          />
          <ActionItems
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
