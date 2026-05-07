/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderExplorerModalV2Query } from '../__generated__/FolderExplorerModalV2Query.graphql';
import { formatToUUID } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useFileUploadManager } from './FileUploadManager';
import FolderExplorerHeaderV2 from './FolderExplorerHeaderV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeDescriptionV2 from './VFolderNodeDescriptionV2';
import VFolderTextFileEditorModal from './VFolderTextFileEditorModal';
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
  BAIUnmountAfterClose,
  useFetchKey,
  useInterval,
  VFolderFile,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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

const FolderExplorerModalV2: React.FC<FolderExplorerProps> = ({
  vfolderID,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xl } = Grid.useBreakpoint();
  const { styles } = useStyles();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for FolderExplorerModalV2');
  }
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
  // `vfolderID` comes from the URL query param `?folder=…` via
  // `FolderExplorerOpener`, where dashes are stripped for a cleaner URL.
  // The V2 `vfolderV2` resolver expects a canonical `UUID!`, so restore the
  // dashed form via the shared `formatToUUID` helper.
  const vfolderUuid =
    vfolderID.length === 32 ? formatToUUID(vfolderID) : vfolderID;
  const { vfolderNode } = useLazyLoadQuery<FolderExplorerModalV2Query>(
    graphql`
      query FolderExplorerModalV2Query($vfolderId: UUID!) {
        vfolderNode: vfolderV2(vfolderId: $vfolderId) {
          unmanagedPath
          host
          id
          metadata {
            name
          }
          ownership {
            projectId
            project {
              basicInfo {
                name
              }
            }
          }
          ...FolderExplorerHeaderV2Fragment
          ...VFolderNodeDescriptionV2Fragment
        }
      }
    `,
    { vfolderId: vfolderUuid },
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
  const [editingFile, setEditingFile] = useState<{
    file: VFolderFile;
    currentPath: string;
  } | null>(null);
  const { uploadStatus, uploadFiles } = useFileUploadManager(
    vfolderNode?.id,
    vfolderNode?.metadata?.name || undefined,
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
    unitedAllowedPermissionByVolume[vfolderNode?.host ?? ''],
    'download-file',
  );
  // TODO(needs-backend): write/delete capability should be derived from the
  // caller's *effective* permission set on this entity (e.g.,
  // `delete_content`, `write_content`), not from the folder's mount
  // permission. The V2 schema currently exposes only the mount permission via
  // `accessControl.permission` (`READ_ONLY` / `READ_WRITE` / `RW_DELETE`),
  // which is what the folder is mounted *as* into a session — not what the
  // caller is allowed to do on the folder itself. Until the backend exposes a
  // proper effective permission set, allow all callers and let the server
  // enforce authorization. See FR-2619 follow-up.
  const hasDeleteContentPermission = true;
  const hasWriteContentPermission = true;
  // TODO: Skip permission check due to inaccurate API response. Update when API is fixed.
  const hasNoPermissions = false;

  const fileExplorerElement = vfolderNode?.unmanagedPath ? (
    <Alert title={t('explorer.NoExplorerSupportForUnmanagedFolder')} showIcon />
  ) : !hasNoPermissions && vfolderNode ? (
    <BAIFileExplorer
      ref={fileExplorerRef}
      targetVFolderId={vfolderID}
      targetVFolderName={vfolderNode?.metadata?.name ?? 'folder'}
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
              >{`${vfolderNode.metadata?.name}`}</BAILink>
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
      enableEdit={hasWriteContentPermission}
      tableProps={{
        scroll: xl
          ? { x: 'max-content' }
          : { x: 'max-content', y: 'calc(100vh - 400px)' },
      }}
      style={{
        paddingBottom: xl ? token.paddingLG : 0,
      }}
      fileDropContainerRef={bodyRef}
      onClickEditFile={(file, currentPath) => {
        setEditingFile({ file, currentPath });
      }}
    />
  ) : null;

  const vFolderDescriptionElement = vfolderNode ? (
    <VFolderNodeDescriptionV2 vfolderNodeFrgmt={vfolderNode} />
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
        vfolderNode ? (
          <FolderExplorerHeaderV2
            titleStyle={{
              zIndex: token.zIndexPopupBase + 2,
            }}
            vfolderNodeFrgmt={vfolderNode}
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
        {deferredOpen !== modalProps.open || vfolderNode === undefined ? (
          <Skeleton active />
        ) : (
          <BAIFlex direction="column" gap={'lg'} align="stretch">
            {vfolderNode === null ? (
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
            ) : currentProject?.id !== vfolderNode?.ownership?.projectId &&
              !!vfolderNode?.ownership?.projectId ? (
              <Alert
                title={
                  vfolderNode.ownership?.project?.basicInfo?.name
                    ? t('data.NotInProject', {
                        projectName:
                          vfolderNode.ownership.project.basicInfo.name,
                      })
                    : t('data.BelongsToDifferentProject')
                }
                type="info"
                showIcon
              />
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
      <BAIUnmountAfterClose>
        <VFolderTextFileEditorModal
          open={!!editingFile}
          targetVFolderId={vfolderID}
          currentPath={editingFile?.currentPath || '.'}
          fileInfo={editingFile?.file || null}
          uploadFiles={uploadFiles}
          onRequestClose={(success) => {
            if (success) {
              fileExplorerRef.current?.refetch();
            }
            setEditingFile(null);
          }}
        />
      </BAIUnmountAfterClose>
    </BAIModal>
  );
};

export default FolderExplorerModalV2;
