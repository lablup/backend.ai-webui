import { useFileUploadManager } from './FileUploadManager';
import FolderExplorerHeader from './FolderExplorerHeader';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeDescription from './VFolderNodeDescription';
import { Alert, Divider, Grid, Skeleton, Splitter, theme } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import {
  BAIFileExplorer,
  BAIFileExplorerRef,
  BAIFlex,
  BAILink,
  BAIModal,
  BAIModalProps,
  toGlobalId,
  useInterval,
} from 'backend.ai-ui';
import _ from 'lodash';
import { Suspense, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { FolderExplorerModalQuery } from 'src/__generated__/FolderExplorerModalQuery.graphql';
import {
  useCurrentDomainValue,
  useFetchKey,
  useSuspendedBackendaiClient,
} from 'src/hooks';
import { useSetBAINotification } from 'src/hooks/useBAINotification';
import { useCurrentProjectValue } from 'src/hooks/useCurrentProject';
import { useMergedAllowedStorageHostPermission } from 'src/hooks/useMergedAllowedStorageHostPermission';

const useStyles = createStyles(({ css }) => ({
  baiModalHeader: css`
    .ant-modal-title {
      width: 100%;
    }
  `,
}));

export interface FolderExplorerElement extends HTMLDivElement {
  _fetchVFolder: () => void;
  _openDeleteMultipleFileDialog: () => void;
  openMkdirDialog: () => void;
  handleUpload: (name: 'file' | 'folder') => void;
}

export interface FileItem {
  name: string;
  type: string;
  size: number;
  mode: string;
  created: string;
  modified: string;
}

interface FolderExplorerProps extends BAIModalProps {
  vfolderID: string;
  onRequestClose: () => void;
}

const FolderExplorerModal: React.FC<FolderExplorerProps> = ({
  vfolderID,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xl } = Grid.useBreakpoint();
  const { styles } = useStyles();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentUserAccessKey = baiClient?._config?.accessKey;
  const fileExplorerRef = useRef<BAIFileExplorerRef>(null);
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProject.id,
      currentUserAccessKey,
    );
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const deferredOpen = useDeferredValue(modalProps.open);
  const { vfolder_node } = useLazyLoadQuery<FolderExplorerModalQuery>(
    graphql`
      query FolderExplorerModalQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) {
          group
          unmanaged_path @since(version: "25.04.0")
          permissions
          host
          id
          name
          ...FolderExplorerHeaderFragment
          ...VFolderNodeDescriptionFragment
          ...VFolderNameTitleNodeFragment
        }
      }
    `,
    { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderID) },
    {
      // Only fetch when both deferredOpen and modalProps.open are true to prevent unnecessary requests during React transitions
      fetchPolicy:
        deferredOpen && modalProps.open ? 'store-and-network' : 'store-only',
    },
  );

  // FIXME: This is a temporary workaround to notify file deletion to use WebUI Notification.
  const { upsertNotification, closeNotification } = useSetBAINotification();
  const { generateFolderPath } = useFolderExplorerOpener();
  const [deletingFilePaths, setDeletingFilePaths] = useState<Array<string>>([]);
  const { uploadStatus, uploadFiles } = useFileUploadManager(
    vfolder_node?.id,
    vfolder_node?.name || undefined,
  );
  // Polling to update fetchKey when there are pending uploads
  useInterval(
    () => {
      fileExplorerRef.current?.refetch();
    },
    uploadStatus && !_.isEmpty(uploadStatus?.pendingFiles) ? 5000 : null,
  );
  // Also update fetchKey when uploadStatus changes to completed
  useEffect(() => {
    if (uploadStatus && _.isEmpty(uploadStatus?.pendingFiles)) {
      updateFetchKey();
    }
  }, [uploadStatus, updateFetchKey]);

  const hasDownloadContentPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolder_node?.host ?? ''],
    'download-file',
  );
  const hasDeleteContentPermission = _.includes(
    vfolder_node?.permissions,
    'delete_content',
  );
  const hasWriteContentPermission = _.includes(
    vfolder_node?.permissions,
    'write_content',
  );
  // TODO: Skip permission check due to inaccurate API response. Update when API is fixed.
  const hasNoPermissions = false;

  const fileExplorerElement = vfolder_node?.unmanaged_path ? (
    <Alert title={t('explorer.NoExplorerSupportForUnmanagedFolder')} showIcon />
  ) : !hasNoPermissions && vfolder_node ? (
    <BAIFileExplorer
      ref={fileExplorerRef}
      targetVFolderId={vfolderID}
      deletingFilePaths={deletingFilePaths}
      fetchKey={fetchKey}
      onUpload={(files: RcFile[], currentPath: string) => {
        uploadFiles(files, vfolderID, currentPath);
      }}
      onDeleteFilesInBackground={(
        bgTaskId,
        targetVFolderId,
        deletingFilePaths,
      ) => {
        setDeletingFilePaths(deletingFilePaths);
        upsertNotification({
          key: `delete:${bgTaskId}`,
          open: true,
          message: (
            <span>
              {t('explorer.VFolder')}:&nbsp;
              <BAILink
                style={{
                  fontWeight: 'normal',
                }}
                to={generateFolderPath(targetVFolderId)}
                onClick={() => {
                  closeNotification(`delete:${bgTaskId}`);
                }}
              >{`${vfolder_node.name}`}</BAILink>
            </span>
          ),
          backgroundTask: {
            status: 'pending',
            taskId: bgTaskId,
            promise: null,
            percent: 0,
            onChange: {
              pending: t('explorer.DeletingSelectedItems'),
              resolved: () => {
                setDeletingFilePaths([]);
                return t('explorer.SelectedItemsDeletedSuccessfully');
              },
              rejected: () => {
                setDeletingFilePaths([]);
                return t('explorer.SelectedItemsDeletionFailed');
              },
            },
          },
        });
      }}
      enableDownload={hasDownloadContentPermission}
      enableDelete={hasDeleteContentPermission}
      enableWrite={hasWriteContentPermission}
      tableProps={{
        scroll: xl
          ? { x: 'max-content' }
          : { x: 'max-content', y: 'calc(100vh - 400px)' },
      }}
      style={{
        paddingBottom: xl ? token.paddingLG : 0,
      }}
      fileDropContainerRef={bodyRef}
    />
  ) : null;

  const vFolderDescriptionElement = vfolder_node ? (
    <VFolderNodeDescription vfolderNodeFrgmt={vfolder_node} />
  ) : null;

  return (
    <BAIModal
      className={styles.baiModalHeader}
      width={'90%'}
      keyboard
      destroyOnHidden
      footer={null}
      style={{ maxWidth: '1600px' }}
      styles={{
        body: {
          height: '100vh',
        },
      }}
      title={
        vfolder_node ? (
          <FolderExplorerHeader
            titleStyle={{
              zIndex: token.zIndexPopupBase + 2,
            }}
            vfolderNodeFrgmt={vfolder_node}
          />
        ) : null
      }
      bodyProps={{
        ref: bodyRef,
      }}
      onCancel={() => {
        onRequestClose();
      }}
      {...modalProps}
    >
      <Suspense fallback={<Skeleton active />}>
        {/* Use <Skeleton/> instead of using `loading` prop because layout align issue. */}
        {deferredOpen !== modalProps.open || vfolder_node === undefined ? (
          <Skeleton active />
        ) : (
          <BAIFlex direction="column" gap={'lg'} align="stretch">
            {vfolder_node === null ? (
              <Alert
                title={t('explorer.FolderNotFoundOrNoAccess')}
                type="error"
                showIcon
              />
            ) : hasNoPermissions ? (
              <Alert
                title={t('explorer.NoPermissions')}
                type="error"
                showIcon
              />
            ) : currentProject?.id !== vfolder_node?.group &&
              !!vfolder_node?.group ? (
              <Alert title={t('data.NotInProject')} type="warning" showIcon />
            ) : null}

            {xl ? (
              <Splitter
                style={{
                  gap: token.size,
                }}
                orientation={'horizontal'}
              >
                <Splitter.Panel resizable={false}>
                  {fileExplorerElement}
                </Splitter.Panel>
                <Splitter.Panel defaultSize={500}>
                  {vFolderDescriptionElement}
                </Splitter.Panel>
              </Splitter>
            ) : (
              <BAIFlex direction="column" align="stretch">
                {fileExplorerElement}
                <Divider
                  style={{
                    borderColor: token.colorBorderSecondary,
                  }}
                />
                {vFolderDescriptionElement}
              </BAIFlex>
            )}
          </BAIFlex>
        )}
      </Suspense>
    </BAIModal>
  );
};

export default FolderExplorerModal;
