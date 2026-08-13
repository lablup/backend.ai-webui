/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx.
 - Modal shell: BUI `BAIModal` with the custom `headerContent` slot (the
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
import { useIsProjectAgnosticPage } from '../hooks/useIsProjectAgnosticPage';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useBAIBreakpoint } from '../theme-shim';
import { toProjectContext } from '../types/projectContext';
import BAIErrorBoundary from './BAIErrorBoundary';
import BAITabs from './BAITabs';
import { useFileUploadManager } from './FileUploadManager';
import type { RcFile } from './FileUploadManager';
import FolderExplorerHeaderV2 from './FolderExplorerHeaderV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import ScopedAuditLog, { ScopedAuditLogQuery } from './ScopedAuditLog';
import VFolderNodeDescriptionV2 from './VFolderNodeDescriptionV2';
import VFolderTextFileEditorModal from './VFolderTextFileEditorModal';
import { Banner } from '@astryxdesign/core/Banner';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { VStack } from '@astryxdesign/core/Stack';
import { BAISkeletonAstryx as BAISkeleton } from 'backend.ai-ui';
import {
  BAISkeleton,
  BAIFileExplorer,
  BAIFileExplorerRef,
  BAILink,
  BAIModal,
  type BAIModalProps,
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

/**
 * Height cap for the explorer dialog. The legacy modal derived its own from
 * `calc(100vh - 174px)` (header 69 + footer band 57 + `marginLG * 2`); 95vh is
 * the ticket-16 stand-in and is also what the min-height below is measured
 * against, so the two must stay written as one value.
 */
const EXPLORER_MAX_HEIGHT = '95vh';

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
  // This modal is globally mounted (no page parent), so it is the sanctioned
  // exception (ADR-0001) that may consult the route to decide its project
  // context: on the project-agnostic routes there is no ambient project
  // context; elsewhere it narrows the ambient current project (interim state
  // until a page-owned opener exists).
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const currentProject = useCurrentProjectValue();
  const pageProject = isProjectAgnosticPage
    ? null
    : toProjectContext(currentProject);
  const currentUserAccessKey = baiClient?._config?.accessKey;
  const fileExplorerRef = useRef<BAIFileExplorerRef>(null);
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

  // Permission calculation follows the folder's own ownership project when
  // the folder is project-owned (what the user can do must not depend on the
  // header selection). For user-owned folders there is no ownership project:
  // keep the previous ambient scope on general pages, and skip the
  // group-scope lookup entirely on super-admin routes (`null`).
  const permissionProjectId =
    vfolderNode?.ownership?.projectId ?? pageProject?.id ?? null;
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      permissionProjectId,
      currentUserAccessKey,
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
      // NOTE: the legacy `tableProps.scroll` ({x:'max-content'} at `xl`,
      // plus a `y: calc(100vh - 400px)` body cap below it) is gone on purpose:
      // `BAITable` accepts and ignores `scroll` (Astryx's own scroll
      // wrapper owns horizontal overflow), and the dialog body is the scroll
      // container for the vertical axis now.
      style={{
        // Legacy `paddingBottom: token.paddingLG` = 24px = `--spacing-6`.
        paddingBottom: xl ? 'var(--spacing-6)' : 0,
      }}
      fileDropContainerRef={bodyRef}
      onClickEditFile={(file, currentPath) => {
        setEditingFile({ file, currentPath });
      }}
    />
  ) : null;

  // antd's `Tabs` reserved `token.margin` (16px) under the tab bar
  // (`.ant-tabs-nav { margin: 0 0 16px }`) and this call site added
  // `styles.content.paddingBottom = token.paddingContentVertical` (12px).
  // `BAITabs` renders the active panel bare, so both gutters have to be
  // restored around the panel content — scoped here rather than in the shared
  // wrapper, whose other five call sites were signed off flush.
  const infoPanelPanelStyle: React.CSSProperties = {
    paddingBlockStart: 'var(--spacing-4)',
    paddingBlockEnd: 'var(--spacing-3)',
  };

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
          children: (
            <div style={infoPanelPanelStyle}>
              <VFolderNodeDescriptionV2 vfolderNodeFrgmt={vfolderNode} />
            </div>
          ),
        },
        {
          key: 'auditLog',
          label: t('auditLog.AuditLog'),
          children: (
            <div style={infoPanelPanelStyle}>
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
            </div>
          ),
        },
      ]}
    />
  ) : null;

  return (
    <BAIModal
      width={'min(90%, 1900px)'}
      maxHeight={EXPLORER_MAX_HEIGHT}
      // FILL, don't shrink-wrap. The legacy antd modal pinned
      // `styles.body = { height: '100vh' }`, which `BAIModal` then clamped with
      // its own `maxHeight: calc(100vh - 174px)` — net effect: the explorer was
      // ALWAYS a near-full-height panel. Astryx's `Dialog` is content-sized
      // with `maxHeight` only as a cap, so the conversion turned it into a
      // short box that grew with its content (measured 47% of the viewport at
      // 1600px wide vs the legacy ~90%). Pushing the min-height onto the
      // `Layout` restores the legacy proportion: the dialog cap minus the
      // dialog's own block padding, which the theme publishes as
      // `--astryx-dialog-padding-block-*` on `.astryx-dialog`.
      styles={{
        container: {
          minHeight: `calc(${EXPLORER_MAX_HEIGHT} - var(--astryx-dialog-padding-block-start) - var(--astryx-dialog-padding-block-end))`,
        },
      }}
      headerContent={
        vfolderNode ? (
          <FolderExplorerHeaderV2
            vfolderNodeFrgmt={vfolderNode}
            // ADR-0001: on super-admin routes `pageProject` is `null` — the
            // FileBrowser/SFTP buttons render disabled with the tooltip
            // below, and rename gating falls back to owner/super-admin.
            project={pageProject}
            noProjectTooltip={
              isProjectAgnosticPage
                ? t('data.CannotLaunchSessionInAdminMenu')
                : undefined
            }
          />
        ) : (
          <span />
        )
      }
      closeLabel={t('button.Close')}
      bodyRef={bodyRef}
      maskClosable={false}
      footer={null}
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
          <VStack
            gap={6}
            align="stretch"
            style={{
              minHeight: '100%',
              // Astryx's `Table` bleeds out of its container by design: its
              // scroll wrapper carries
              // `margin-inline: calc(-1 * var(--container-padding-inline-*))`
              // so rows run edge-to-edge inside a padded surface. `LayoutContent`
              // publishes the dialog's 24px gutter into those vars, so the file
              // list and the audit-log table were pulled 24px past the modal's
              // gutter on BOTH sides — and at `xl` the right bleed ran the file
              // table 23px UNDER the resize handle and the info panel. The
              // legacy antd tables sat inside the body gutter; zeroing the vars
              // for this subtree restores that without touching the app-wide
              // card/table look.
              ['--container-padding-inline-start' as string]: '0px',
              ['--container-padding-inline-end' as string]: '0px',
              ['--container-padding-block-start' as string]: '0px',
              ['--container-padding-block-end' as string]: '0px',
            }}
          >
            {vfolderNode === null ? (
              <Banner
                title={t('explorer.FolderNotFoundOrNoAccess')}
                status="error"
              />
            ) : hasNoPermissions ? (
              <Banner title={t('explorer.NoPermissions')} status="error" />
            ) : pageProject !== null &&
              pageProject.id !== vfolderNode?.ownership?.projectId &&
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
                // drag-resizable width (default 45%, min 550px). `gap` restores
                // the legacy `Splitter style={{ gap: token.size }}` — 16px of
                // total separation between the two panes, which the conversion
                // dropped (the 1px handle sat flush against both). The flex gap
                // applies on BOTH sides of the handle, so half the legacy value
                // (`--spacing-2`) reproduces it: 8 + 1 + 8 = 17px.
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    minWidth: 0,
                    gap: 'var(--spacing-2)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {fileExplorerElement}
                  </div>
                  {/* The handle's own `height: 100%` resolves to `auto` here —
                      this row is sized by `min-height` only, which makes the
                      percentage indefinite, collapsing the handle (divider +
                      pill) to ~30px pinned at the top, over the tab strip. A
                      stretched flex wrapper gives it a definite height. */}
                  <div style={{ display: 'flex', alignSelf: 'stretch' }}>
                    <ResizeHandle
                      direction="horizontal"
                      isReversed
                      hasDivider
                      label={t('explorer.Metadata')}
                      resizable={infoPanel.props}
                    />
                  </div>
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
