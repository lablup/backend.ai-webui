import { useFileUploadManager } from './FileUploadManager';
import FolderExplorerHeader from './FolderExplorerHeader';
import VFolderNodeDescription from './VFolderNodeDescription';
import { Alert, Divider, Grid, Splitter, theme } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import {
  BAIFileExplorer,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  toGlobalId,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { FolderExplorerModalQuery } from 'src/__generated__/FolderExplorerModalQuery.graphql';
import {
  useCurrentDomainValue,
  useFetchKey,
  useSuspendedBackendaiClient,
} from 'src/hooks';
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
  const folderExplorerRef = useRef<FolderExplorerElement>(null);
  const { uploadStatus, uploadFiles } = useFileUploadManager(vfolderID);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const currentProject = useCurrentProjectValue();
  const currentUserAccessKey = baiClient?._config?.accessKey;
  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProject.id,
      currentUserAccessKey,
    );
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (uploadStatus && _.isEmpty(uploadStatus?.pendingFiles)) {
      updateFetchKey();
    }
  }, [uploadStatus, updateFetchKey]);

  const { vfolder_node } = useLazyLoadQuery<FolderExplorerModalQuery>(
    graphql`
      query FolderExplorerModalQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) {
          group
          unmanaged_path @since(version: "25.04.0")
          permissions
          host
          ...FolderExplorerHeaderFragment
          ...VFolderNodeDescriptionFragment
          ...VFolderNameTitleNodeFragment
        }
      }
    `,
    { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderID) },
    {
      fetchPolicy: modalProps.open ? 'network-only' : 'store-only',
    },
  );

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
    <Alert
      message={t('explorer.NoExplorerSupportForUnmanagedFolder')}
      showIcon
    />
  ) : !hasNoPermissions ? (
    <BAIFileExplorer
      targetVFolderId={vfolderID}
      fetchKey={fetchKey}
      onUpload={(files: RcFile[], currentPath: string) => {
        uploadFiles(files, vfolderID, currentPath);
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
    <VFolderNodeDescription
      vfolderNodeFrgmt={vfolder_node}
      onRequestRefresh={() => {
        folderExplorerRef.current?._fetchVFolder();
      }}
    />
  ) : null;

  return (
    <BAIModal
      className={styles.baiModalHeader}
      width={'90%'}
      centered
      keyboard
      destroyOnHidden
      footer={null}
      title={
        vfolder_node ? (
          <FolderExplorerHeader
            titleStyle={{
              zIndex: token.zIndexPopupBase + 2,
            }}
            vfolderNodeFrgmt={vfolder_node}
            folderExplorerRef={folderExplorerRef}
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
      <BAIFlex direction="column" gap={'lg'} align="stretch">
        {!vfolder_node ? (
          <Alert
            message={t('explorer.FolderNotFoundOrNoAccess')}
            type="error"
            showIcon
          />
        ) : hasNoPermissions ? (
          <Alert message={t('explorer.NoPermissions')} type="error" showIcon />
        ) : currentProject?.id !== vfolder_node?.group &&
          !!vfolder_node?.group ? (
          <Alert message={t('data.NotInProject')} type="warning" showIcon />
        ) : null}

        {xl ? (
          <Splitter
            // Force re-render component when xl breakpoint changes to reset panel sizes
            // This ensures defaultSize is recalculated based on current screen size
            key={xl ? 'large' : 'small'}
            style={{
              gap: token.size,
              // maxHeight: 'calc(100vh - 220px)',
            }}
            layout={xl ? 'horizontal' : 'vertical'}
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
        <div style={{ display: 'none' }}>
          {/* @ts-ignore  TODO: delete below after https://lablup.atlassian.net/browse/FR-1150 */}
          <backend-ai-folder-explorer
            ref={folderExplorerRef}
            active
            vfolderID={vfolderID}
          />
        </div>
      </BAIFlex>
    </BAIModal>
  );
};

export default FolderExplorerModal;
