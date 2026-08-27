import {
  convertToDecimalUnit,
  filterOutEmpty,
  localeCompare,
} from '../../../helper';
import { useBAIi18n } from '../../../hooks/useBAIi18n';
import { theme } from '../../../theme-shim';
import BAIFetchKeyButton from '../../BAIFetchKeyButton';
import BAIFlex from '../../BAIFlex';
import BAIUnmountAfterClose from '../../BAIUnmountAfterClose';
import { BAIColumnsType, BAITable, BAITableProps } from '../../Table';
import useConnectedBAIClient from '../../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import { VFolderFile } from '../../provider/BAIClientProvider/types';
import DeleteSelectedItemsModal from './DeleteSelectedItemsModal';
import DragAndDrop from './DragAndDrop';
import EditableFileName from './EditableFileName';
import ExplorerActionControls from './ExplorerActionControls';
import FileItemControls from './FileItemControls';
import { useDragOverlay, useSearchVFolderFiles } from './hooks';
import type { RcFile } from './hooks';
import { BreadcrumbItem, Breadcrumbs } from '@astryxdesign/core/Breadcrumbs';
import type { DropdownMenuOption } from '@astryxdesign/core/DropdownMenu';
import { Skeleton } from '@astryxdesign/core/Skeleton';
import { Text } from '@astryxdesign/core/Text';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { File, Folder, HouseIcon } from 'lucide-react';
import {
  createContext,
  Suspense,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

export const FolderInfoContext = createContext<{
  targetVFolderId: string;
  targetVFolderName: string;
  currentPath: string;
}>({
  targetVFolderId: '',
  targetVFolderName: '',
  currentPath: '.',
});

export interface BAIFileExplorerRef {
  refetch: () => void;
}

export interface BAIFileExplorerProps {
  targetVFolderId: string;
  targetVFolderName?: string;
  fetchKey?: string;
  // 'explorer' (default): full file manager — multi-select, upload, file
  // editing. 'directoryPicker': directory-selection UI — files are visible
  // but disabled, a row click navigates into the directory, checkbox
  // selection and file-creation/upload entry points are hidden; folder CRUD
  // (create / rename / delete) stays available.
  mode?: 'explorer' | 'directoryPicker';
  // Path inside the vfolder to start browsing from, in currentPath notation
  // ('.' = root). Applied once on mount.
  defaultPath?: string;
  // Reports currentPath ('.' = root) whenever navigation changes it,
  // including the initial value on mount.
  onChangeCurrentPath?: (currentPath: string) => void;
  onUpload?: (files: Array<RcFile>, currentPath: string) => void;
  tableProps?: Partial<BAITableProps<VFolderFile>>;
  style?: React.CSSProperties;
  fileDropContainerRef?: React.RefObject<HTMLDivElement | null>;
  enableDownload?: boolean;
  enableDelete?: boolean;
  enableWrite?: boolean;
  // Gates upload entry points (upload dropdown + drag-drop). Defaults to
  // `enableWrite` for backwards compatibility — callers that need to gate
  // upload independently (e.g., on the `upload-file` host permission) should
  // pass this explicitly.
  enableUpload?: boolean;
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
  targetVFolderName,
  fetchKey,
  mode = 'explorer',
  defaultPath,
  onChangeCurrentPath,
  onUpload,
  tableProps,
  fileDropContainerRef,
  enableDownload = false,
  enableDelete = false,
  enableWrite = false,
  enableUpload = false,
  enableEdit = false,
  onDeleteFilesInBackground,
  deletingFilePaths,
  onClickEditFile,
  style,
  ref,
}) => {
  'use memo';

  const { t } = useBAIi18n();
  const { token } = theme.useToken();

  // The container ref is parent-owned; the hook captures its element when
  // dragging starts.
  const {
    isDragMode,
    portalContainer: dragPortalContainer,
    close: closeDragOverlay,
  } = useDragOverlay(fileDropContainerRef);
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
  const isDirectoryPicker = mode === 'directoryPicker';

  useImperativeHandle(
    ref,
    () => ({
      refetch,
    }),
    [refetch],
  );

  // Applied once on mount; idempotent under StrictMode.
  const navigateToDefaultPath = useEffectEvent(() => {
    if (defaultPath && defaultPath !== '.') {
      navigateToPath(defaultPath);
    }
  });
  useEffect(() => {
    navigateToDefaultPath();
  }, []);

  const notifyCurrentPath = useEffectEvent(() => {
    onChangeCurrentPath?.(currentPath);
  });
  useEffect(() => {
    notifyCurrentPath();
  }, [currentPath]);

  // to-astryx W2-D: antd `Breadcrumb items={[{title, onClick, menu}]}` ->
  // Astryx `Breadcrumbs` + `BreadcrumbItem` children (MAPPING §4).
  //
  // PILOT-DECISION: the sibling-folder dropdown moves onto `BreadcrumbItem`'s
  // NATIVE `menu` prop, which takes `DropdownMenuOption[]` — `{label: string,
  // onClick}` rows. antd's rows carried a JSX label whose own `onClick` did
  // the navigating (a click handler on a `<div>` inside a menu row, reachable
  // by mouse only). The Astryx rows are real menu items: the label is the
  // folder name, the icon is the folder glyph, and `onClick` belongs to the
  // ITEM — so keyboard selection works, which it did not before.
  const breadCrumbItems = useMemo(() => {
    const pathParts = currentPath === '.' ? [] : currentPath.split('/');

    const items: Array<{
      key: string;
      label: React.ReactNode;
      onClick: () => void;
      menu?: Array<DropdownMenuOption>;
    }> = [
      {
        key: '.',
        label: <HouseIcon size="1em" />,
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

      const menuItems: Array<DropdownMenuOption> = parentFolders.map((dir) => ({
        label: dir.name,
        icon: <Folder size="1em" />,
        onClick: () => {
          const newPath =
            parentPath === '.' ? dir.name : `${parentPath}/${dir.name}`;
          navigateToPath(newPath);
          setSelectedItems([]);
        },
      }));

      items.push({
        key: navigatePath,
        label: part,
        onClick: () => {
          navigateToPath(navigatePath);
          setSelectedItems([]);
        },
        menu: menuItems.length > 1 ? menuItems : undefined,
      });
    });

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, directoryTree]);

  const tableColumns: BAIColumnsType<VFolderFile> = filterOutEmpty([
    {
      title: t('comp:FileExplorer.Name'),
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a.name, b.name),
      render: (name, record) =>
        isDirectoryPicker && record.type !== 'DIRECTORY' ? (
          // In the directory picker, files are shown for context but are not
          // interactive — only directories can be entered and chosen.
          <BAIFlex gap="xs" style={{ display: 'inline-flex' }}>
            <File style={{ color: token.colorTextDisabled }} size="1em" />
            <Text color="disabled" maxLines={1} style={{ maxWidth: 200 }}>
              {name}
            </Text>
          </BAIFlex>
        ) : (
          <EditableFileName
            fileInfo={record}
            existingFiles={files?.items || []}
            disabled={!enableWrite}
            onEndEdit={() => {
              refetch();
            }}
            onClick={(e) => {
              e.stopPropagation();
              // The directory name itself is an Astryx `Link` <button> (no
              // href), so excluding every <button> swallowed the navigating
              // click; the rename trigger stops propagation on its own, and
              // only its inline <form> has to be excluded here (FR-3602).
              if ((e.target as HTMLElement).closest('form')) return;
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

        if (isDirectoryPicker && record.type !== 'DIRECTORY') {
          return null;
        }

        return (
          <Suspense fallback={<Skeleton height={24} width={80} />}>
            <FileItemControls
              selectedItem={record}
              onClickDelete={() => {
                setSelectedSingleItem(record);
              }}
              onClickEdit={() => onClickEditFile?.(record, currentPath)}
              enableDownload={!isDirectoryPicker && enableDownload}
              enableDelete={enableDelete}
              enableEdit={!isDirectoryPicker && enableEdit}
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

  return (
    <FolderInfoContext.Provider
      value={{
        targetVFolderId,
        targetVFolderName: targetVFolderName ?? '',
        currentPath,
      }}
    >
      {isDragMode && enableUpload && (
        <DragAndDrop
          portalContainer={dragPortalContainer || undefined}
          onDragEnd={closeDragOverlay}
          onUpload={(files, currentPath) => onUpload?.(files, currentPath)}
        />
      )}
      <BAIFlex
        direction="column"
        align="stretch"
        justify="start"
        gap="md"
        style={{ height: '100%', ...style }}
      >
        {/* Wraps so a narrow container stacks the path above the actions
            instead of pushing them out of a clipped pane (FR-3590). */}
        <BAIFlex align="center" justify="between" wrap="wrap" gap="xs">
          <Breadcrumbs
            label={t('comp:FileExplorer.Path')}
            style={{
              marginLeft: token.marginXXS,
            }}
          >
            {breadCrumbItems.map((item, index) => (
              <BreadcrumbItem
                key={item.key}
                onClick={item.onClick}
                menu={item.menu}
                isCurrent={index === breadCrumbItems.length - 1}
              >
                {item.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
          <ExplorerActionControls
            selectedFiles={selectedItems}
            mode={mode}
            enableDownload={enableDownload}
            enableDelete={enableDelete}
            enableWrite={enableWrite}
            enableUpload={enableUpload}
            onUpload={(files, currentPath) => onUpload?.(files, currentPath)}
            onFolderCreated={
              isDirectoryPicker
                ? (folderName) => {
                    // Jump straight into the created folder so "select this
                    // location" picks it.
                    navigateDown(folderName);
                  }
                : undefined
            }
            onDeleteFilesInBackground={onDeleteFilesInBackground}
            onClearSelection={() => setSelectedItems([])}
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
          scroll={{ x: 'max-content' }}
          rowKey="name"
          dataSource={files?.items}
          columns={tableColumns}
          // If no files have been loaded yet (including cache), show spinner loading
          spinnerLoading={isFirstFetching}
          // If files have been loaded before, use normal loading style (opacity)
          loading={!isFirstFetching && isFetching}
          pagination={false}
          rowSelection={
            isDirectoryPicker
              ? undefined
              : {
                  type: 'checkbox',
                  selectedRowKeys: _.map(selectedItems, 'name'),
                  onChange: (selectedRowKeys) => {
                    setSelectedItems(
                      files?.items?.filter((file) =>
                        selectedRowKeys.includes(file.name),
                      ) || [],
                    );
                  },
                }
          }
          onRow={(record) =>
            isDirectoryPicker
              ? {
                  onClick: () => {
                    if (record.type === 'DIRECTORY') {
                      navigateDown(record.name);
                    }
                  },
                  style:
                    record.type === 'DIRECTORY'
                      ? { cursor: 'pointer' }
                      : { cursor: 'not-allowed' },
                }
              : {
                  onClick: () => {
                    const isSelected = selectedItems.some(
                      (item) => item.name === record.name,
                    );
                    if (isSelected) {
                      setSelectedItems(
                        selectedItems?.filter(
                          (item) => item.name !== record.name,
                        ),
                      );
                    } else {
                      setSelectedItems([...selectedItems, record]);
                    }
                  },
                }
          }
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
