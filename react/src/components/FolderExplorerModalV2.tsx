/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx.
 - Modal shell: `BAIModalAstryx` with the custom `headerContent` slot (the
   explorer header is JSX — identicon + editable name + action buttons — and
   Astryx `DialogHeader.title` is a plain string, P2) and `bodyRef` (the file
   drag-and-drop container).
 - antd `Splitter` becomes `useResizable` + `ResizeHandle` + `Layout` slots
   (MAPPING §5: Splitter → useResizable).
 - antd `Tabs` becomes the converted `BAITabs` wrapper (renders the active
   panel itself). The `type={xl ? 'card' : 'line'}` visual split is intact:
   QA2-A gave `BAITabs` a real card variant, so both looks exist again.
 - `Grid.useBreakpoint` becomes `useBAIBreakpoint` (RESPONSIVE-POLICY R2).
 - The `createStyles` block (`.ant-modal-title` width) is deleted — dead CSS
   once the modal is no longer antd (P6).
 - `BAIFileExplorer` / `ScopedAuditLog` / `BAILink` stay BUI (frontier:
   tickets 25/28 own their internals).
*/
import { FolderExplorerModalV2Query } from '../__generated__/FolderExplorerModalV2Query.graphql';
import type { ScopedAuditLogQuery as ScopedAuditLogQueryType } from '../__generated__/ScopedAuditLogQuery.graphql';
import { formatToUUID } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useBAIBreakpoint } from '../theme-shim';
import BAIErrorBoundary from './BAIErrorBoundary';
import BAITabs from './BAITabs';
import { useFileUploadManager } from './FileUploadManager';
import type { RcFile } from './FileUploadManager';
import FolderExplorerHeaderV2 from './FolderExplorerHeaderV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ScopedAuditLog, { ScopedAuditLogQuery } from './ScopedAuditLog';
import VFolderNodeDescriptionV2 from './VFolderNodeDescriptionV2';
import VFolderTextFileEditorModal from './VFolderTextFileEditorModal';
import BAIModal from './astryx-bui/BAIModalAstryx';
import type { BAIModalAstryxProps as BAIModalProps } from './astryx-bui/BAIModalAstryx';
import BAISkeleton from './astryx-bui/BAISkeletonAstryx';
import { Banner } from '@astryxdesign/core/Banner';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { VStack } from '@astryxdesign/core/Stack';
import {
  BAIFileExplorer,
  BAIFileExplorerRef,
  BAILink,
  BAIUnmountAfterClose,
  useFetchKey,
  useInterval,
  VFolderFile,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  type ComponentProps,
  Suspense,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useQueryLoader } from 'react-relay';

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

interface FolderExplorerProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: the opener passes `open`. */
  open?: boolean;
  vfolderID: string;
  onRequestClose: () => void;
  /** Accepted and ignored — the Astryx modal always unmounts when closed. */
  destroyOnHidden?: boolean;
}

const FolderExplorerModalV2: React.FC<FolderExplorerProps> = ({
  vfolderID,
  onRequestClose,
  destroyOnHidden: _destroyOnHidden,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { xl } = useBAIBreakpoint();

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

  // The info panel keeps its antd-Splitter geometry: default 45%, min 550px.
  const infoPanel = useResizable({
    defaultSize: '45%',
    minSizePx: 550,
  });

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

  const [activeTab, setActiveTab] = useState<'metadata' | 'auditLog'>(
    'metadata',
  );
  const [auditLogQueryRef, loadAuditLogQuery] =
    useQueryLoader<ScopedAuditLogQueryType>(ScopedAuditLogQuery);

  const { baiPaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const reloadAuditLogQuery: ComponentProps<
    typeof ScopedAuditLog
  >['onReload'] = (variables, options) => {
    const limit = variables.limit ?? 10;
    setTablePaginationOption({
      pageSize: limit,
      current: variables.offset ? Math.floor(variables.offset / limit) + 1 : 1,
    });
    loadAuditLogQuery(variables, options);
  };

  const loadAuditLog = () => {
    if (!vfolderNode?.id) {
      return;
    }
    loadAuditLogQuery(
      {
        scope: {
          entity: [{ entityType: 'VFOLDER', entityId: vfolderUuid }],
        },
        orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
        limit: baiPaginationOption.limit,
        offset: baiPaginationOption.offset,
      },
      { fetchPolicy: 'store-and-network' },
    );
  };

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
  // `upload-file` on the storage host gates the actual upload pipeline:
  // upload buttons (file/folder), drag-drop, and the in-app text editor save
  // (which overwrites the file via the upload API). mkdir / create-file /
  // rename are kept enabled — there is no corresponding host-level
  // capability for them today, and FR-2619 will revisit the effective
  // permission set.
  const hasUploadContentPermission = _.includes(
    unitedAllowedPermissionByVolume[vfolderNode?.host ?? ''],
    'upload-file',
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
    <Banner
      status="info"
      title={t('explorer.NoExplorerSupportForUnmanagedFolder')}
    />
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
      enableUpload={hasUploadContentPermission}
      enableEdit={hasUploadContentPermission}
      tableProps={{
        scroll: xl
          ? { x: 'max-content' }
          : { x: 'max-content', y: 'calc(100vh - 400px)' },
      }}
      style={{
        paddingBottom: xl ? 24 : 0,
      }}
      fileDropContainerRef={bodyRef}
      onClickEditFile={(file, currentPath) => {
        setEditingFile({ file, currentPath });
      }}
    />
  ) : null;

  const vFolderInfoPanelElement = vfolderNode ? (
    <BAITabs
      // Restored (QA2-A): the legacy `type={xl ? 'card' : 'line'}` split. The
      // wide layout puts this panel beside the file list, where the boxed tabs
      // read as a panel header; the narrow layout stacks it, where the
      // underlined strip is lighter.
      type={xl ? 'card' : 'line'}
      activeKey={activeTab}
      onChange={(key: string) => {
        if (key === 'auditLog' && auditLogQueryRef == null) {
          loadAuditLog();
        }
        setActiveTab(key as typeof activeTab);
      }}
      items={[
        {
          key: 'metadata',
          label: t('explorer.Metadata'),
          children: <VFolderNodeDescriptionV2 vfolderNodeFrgmt={vfolderNode} />,
        },
        {
          key: 'auditLog',
          label: t('auditLog.AuditLog'),
          children: (
            <BAIErrorBoundary>
              {auditLogQueryRef ? (
                <Suspense fallback={<BAISkeleton rows={4} />}>
                  <ScopedAuditLog
                    queryRef={auditLogQueryRef}
                    onReload={reloadAuditLogQuery}
                    tableSettings={{}}
                  />
                </Suspense>
              ) : (
                <BAISkeleton rows={4} />
              )}
            </BAIErrorBoundary>
          ),
        },
      ]}
    />
  ) : null;

  return (
    <BAIModal
      width={'min(90%, 1900px)'}
      maxHeight={'95vh'}
      headerContent={
        vfolderNode ? (
          <FolderExplorerHeaderV2 vfolderNodeFrgmt={vfolderNode} />
        ) : (
          <span />
        )
      }
      closeLabel={t('button.Close')}
      bodyRef={bodyRef}
      isOpen={modalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      {...modalProps}
    >
      <Suspense fallback={<BAISkeleton rows={4} />}>
        {/* Use skeleton instead of `isLoading` because of layout alignment. */}
        {deferredOpen !== modalProps.open || vfolderNode === undefined ? (
          <BAISkeleton rows={4} />
        ) : (
          <VStack gap={6} align="stretch" style={{ minHeight: '100%' }}>
            {vfolderNode === null ? (
              <Banner
                title={t('explorer.FolderNotFoundOrNoAccess')}
                status="error"
              />
            ) : hasNoPermissions ? (
              <Banner title={t('explorer.NoPermissions')} status="error" />
            ) : currentProject?.id !== vfolderNode?.ownership?.projectId &&
              !!vfolderNode?.ownership?.projectId ? (
              <Banner
                title={
                  vfolderNode.ownership?.project?.basicInfo?.name
                    ? t('data.NotInProject', {
                        projectName:
                          vfolderNode.ownership.project.basicInfo.name,
                      })
                    : t('data.BelongsToDifferentProject')
                }
                status="info"
              />
            ) : null}

            {vfolderNode && !hasNoPermissions ? (
              xl ? (
                // antd `Splitter` → Astryx `useResizable` + `ResizeHandle`:
                // explorer fills the remaining space, the info panel keeps a
                // drag-resizable width (default 45%, min 550px).
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
                    {vFolderInfoPanelElement}
                  </div>
                </div>
              ) : (
                <VStack align="stretch" gap={6}>
                  {fileExplorerElement}
                  {vFolderInfoPanelElement}
                </VStack>
              )
            ) : null}
          </VStack>
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
