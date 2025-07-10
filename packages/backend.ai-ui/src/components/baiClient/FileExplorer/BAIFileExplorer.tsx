import { FileExplorerFragment$key } from '../../../__generated__/FileExplorerFragment.graphql';
import {
  convertToDecimalUnit,
  convertUnitValue,
  filterEmptyItem,
  localeCompare,
} from '../../../helper';
import { TrashBinIcon } from '../../../icons';
import BAITable from '../../BAITable';
import Flex from '../../Flex';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import ActionItems from './ActionItems';
import ControlItems from './ControlItems';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import FileExplorerBreadcrumb from './FileExplorerBreadcrumb';
import { useSearchVFolderFiles } from './hooks';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { Button, TableColumnsType, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import _ from 'lodash';
import { DownloadIcon } from 'lucide-react';
import { createContext, Suspense, useDeferredValue, useState } from 'react';
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
  targetFolder: string;
  currentPath: string;
}>({
  targetFolder: '',
  currentPath: '.',
});

export interface BAIFileExplorerProps {
  fileExplorerFrgmt?: FileExplorerFragment$key | null;
  targetFolder: string;
}

const BAIFileExplorer: React.FC<BAIFileExplorerProps> = ({
  fileExplorerFrgmt,
  targetFolder,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const [selectedItems, setSelectedItems] = useState<Array<VFolderFile>>([]);
  const [selectedSingleItem, setSelectedSingleItem] =
    useState<VFolderFile | null>(null);
  const { files, isFetching, currentPath, navigateDown, refetch } =
    useSearchVFolderFiles(targetFolder);
  const deferredFetchedFiles = useDeferredValue(files?.items);

  const FileExplorerFragment = useFragment(
    graphql`
      fragment BAIFileExplorerFragment on VirtualFolderNode {
        ...ControlItemsFragment
      }
    `,
    fileExplorerFrgmt,
  );

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
            }}
          >
            <Flex gap="xs">
              <FolderOutlined />
              <Typography.Text
                ellipsis={{
                  tooltip: name,
                }}
                style={{ maxWidth: 200, color: token.colorLink }}
              >
                {name}
              </Typography.Text>
            </Flex>
          </Typography.Link>
        ) : (
          <Flex gap="xs">
            <FileOutlined />
            <Typography.Text
              ellipsis={{
                tooltip: name,
              }}
              style={{ maxWidth: 200 }}
            >
              {name}
            </Typography.Text>
          </Flex>
        ),
    },
    {
      title: t('comp:FileExplorer.Controls'),
      fixed: 'left',
      render: (_, record) => {
        return (
          <Suspense
            fallback={
              <Flex gap="xs">
                <Button
                  type="text"
                  size="small"
                  icon={<DownloadIcon color={token.colorInfo} />}
                  loading
                />
                <Button
                  type="text"
                  size="small"
                  icon={<TrashBinIcon style={{ color: token.colorError }} />}
                  onClick={() => {
                    setSelectedSingleItem(record);
                  }}
                />
              </Flex>
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
        const baseUnit =
          convertUnitValue(_.toString(size), 'auto', {
            base: 1000,
          })?.unit || 'g';
        return size === 0
          ? null
          : convertToDecimalUnit(size, baseUnit)?.displayValue;
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
    <FolderInfoContext.Provider value={{ targetFolder, currentPath }}>
      <Flex direction="column" align="stretch" gap="md">
        <Flex align="stretch" justify="between">
          <FileExplorerBreadcrumb></FileExplorerBreadcrumb>
          <ActionItems
            selectedItems={selectedItems}
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
        </Flex>

        <BAITable
          rowKey="name"
          bordered
          scroll={{ x: 'max-content' }}
          dataSource={deferredFetchedFiles}
          columns={columns}
          loading={files?.items !== deferredFetchedFiles || isFetching}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: _.map(selectedItems, 'name'),
            onChange: (selectedRowKeys) => {
              setSelectedItems(
                deferredFetchedFiles?.filter((file) =>
                  selectedRowKeys.includes(file.name),
                ) || [],
              );
            },
          }}
        />
      </Flex>
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
