/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FolderExplorerModalQuery } from '../__generated__/FolderExplorerModalQuery.graphql';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useBAIBreakpoint } from '../theme-shim';
import { useFileUploadManager } from './FileUploadManager';
import type { RcFile } from './FileUploadManager';
import FolderExplorerHeader from './FolderExplorerHeader';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeDescription from './VFolderNodeDescription';
import VFolderTextFileEditorModal from './VFolderTextFileEditorModal';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAISkeleton,
  BAIFileExplorer,
  BAIFileExplorerRef,
  BAIFlex,
  BAILink,
  BAIModal,
  BAIModalProps,
  BAIUnmountAfterClose,
  toGlobalId,
  useFetchKey,
  useInterval,
  VFolderFile,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();
  // antd `Grid.useBreakpoint` → `useBAIBreakpoint` (RESPONSIVE-POLICY R2).
  const { xl } = useBAIBreakpoint();

  const [fetchKey, updateFetchKey] = useFetchKey();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for FolderExplorerModal');
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

  // antd `Splitter.Panel defaultSize={500}` → `useResizable` (MAPPING §5):
  // the description panel keeps its 500px default and stays drag-resizable.
  const infoPanel = useResizable({
    defaultSize: 500,
    minSizePx: 320,
  });

  const deferredOpen = useDeferredValue(modalProps.open);
  const { vfolder_node } = useLazyLoadQuery<FolderExplorerModalQuery>(
    graphql`
      query FolderExplorerModalQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) {
          group
          group_name
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
  const [editingFile, setEditingFile] = useState<{
    file: VFolderFile;
    currentPath: string;
  } | null>(null);
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

  // antd `Alert` → Astryx `Banner` (MAPPING §4): `type` → `status`, and
  // `showIcon` is dropped because Banner always renders its status icon.
  const fileExplorerElement = vfolder_node?.unmanaged_path ? (
    <Banner
      title={t('explorer.NoExplorerSupportForUnmanagedFolder')}
      status="info"
    />
  ) : !hasNoPermissions && vfolder_node ? (
    <BAIFileExplorer
      ref={fileExplorerRef}
      targetVFolderId={vfolderID}
      targetVFolderName={vfolder_node?.name ?? 'folder'}
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
      enableUpload={hasWriteContentPermission}
      enableEdit={hasWriteContentPermission}
      tableProps={{
        scroll: xl
          ? { x: 'max-content' }
          : { x: 'max-content', y: 'calc(100vh - 400px)' },
      }}
      style={{
        paddingBottom: xl ? token('--spacing-6') : 0,
      }}
      fileDropContainerRef={bodyRef}
      onClickEditFile={(file, currentPath) => {
        setEditingFile({ file, currentPath });
      }}
    />
  ) : null;

  const vFolderDescriptionElement = vfolder_node ? (
    <VFolderNodeDescription vfolderNodeFrgmt={vfolder_node} />
  ) : null;

  return (
    <BAIModal
      className="folder-explorer-modal-header"
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
              zIndex: 1000 + 2,
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
      <Suspense fallback={<BAISkeleton rows={4} />}>
        {/* Use a skeleton instead of the `loading` prop because of layout align issue. */}
        {deferredOpen !== modalProps.open || vfolder_node === undefined ? (
          <BAISkeleton rows={4} />
        ) : (
          <BAIFlex direction="column" gap={'lg'} align="stretch">
            {vfolder_node === null ? (
              <Banner
                title={t('explorer.FolderNotFoundOrNoAccess')}
                status="error"
              />
            ) : hasNoPermissions ? (
              <Banner title={t('explorer.NoPermissions')} status="error" />
            ) : currentProject?.id !== vfolder_node?.group &&
              !!vfolder_node?.group ? (
              <Banner
                title={
                  vfolder_node.group_name
                    ? t('data.NotInProject', {
                        projectName: vfolder_node.group_name,
                      })
                    : t('data.BelongsToDifferentProject')
                }
                status="info"
              />
            ) : null}

            {xl ? (
              // antd `Splitter` → Astryx `useResizable` + `ResizeHandle`
              // (MAPPING §5). The explorer panel was `resizable={false}`, so it
              // simply flexes; the description panel keeps the drag handle.
              <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {fileExplorerElement}
                </div>
                <ResizeHandle
                  direction="horizontal"
                  isReversed
                  hasDivider
                  label={t('explorer.Metadata')}
                  resizable={infoPanel.props}
                />
                <div style={{ width: infoPanel.size, flexShrink: 0 }}>
                  {vFolderDescriptionElement}
                </div>
              </div>
            ) : (
              <BAIFlex direction="column" align="stretch">
                {fileExplorerElement}
                <Divider />
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

export default FolderExplorerModal;
