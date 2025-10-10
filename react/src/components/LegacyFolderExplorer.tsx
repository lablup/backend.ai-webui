import { LegacyFolderExplorerQuery } from '../__generated__/LegacyFolderExplorerQuery.graphql';
import { useFileUploadManager } from './FileUploadManager';
import FolderExplorerHeader from './FolderExplorerHeader';
import VFolderNodeDescription from './VFolderNodeDescription';
import { Alert, Grid, Splitter, theme } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import {
  BAIModal,
  BAIModalProps,
  BAIFileExplorer,
  BAIFlex,
  toGlobalId,
  useSearchVFolderFiles,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const useStyles = createStyles(({ token, css }) => ({
  baiModalHeader: css`
    .ant-modal-title {
      width: 100%;
      margin-right: ${token.marginXXL}px;
    }
  `,
}));

interface LegacyFolderExplorerProps extends BAIModalProps {
  vfolderID: string;
  onRequestClose: () => void;
}
export interface FolderExplorerElement extends HTMLDivElement {
  _fetchVFolder: () => void;
  _openDeleteMultipleFileDialog: () => void;
  openMkdirDialog: () => void;
  handleUpload: (name: 'file' | 'folder') => void;
}

const LegacyFolderExplorer: React.FC<LegacyFolderExplorerProps> = ({
  vfolderID,
  onRequestClose,
  ...modalProps
}) => {
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { xl } = Grid.useBreakpoint();
  const { uploadStatus, uploadFiles } = useFileUploadManager(vfolderID);
  const { refetch } = useSearchVFolderFiles(vfolderID);

  useEffect(() => {
    if (uploadStatus && _.isEmpty(uploadStatus.pending)) {
      refetch();
    }
  }, [uploadStatus, refetch]);

  const { t } = useTranslation();
  // TODO: Events are sent and received as normal,
  // but the Lit Element is not rendered and the values inside are not available but ref is available.
  const folderExplorerRef = useRef<FolderExplorerElement>(null);

  const { vfolder_node } = useLazyLoadQuery<LegacyFolderExplorerQuery>(
    graphql`
      query LegacyFolderExplorerQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) @since(version: "24.03.4") {
          id
          user
          name
          permission
          permissions
          unmanaged_path @since(version: "25.04.0")
          ...FolderExplorerHeaderFragment
          ...VFolderNodeDescriptionFragment
          ...VFolderNameTitleNodeFragment
        }
      }
    `,
    {
      vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderID),
    },
    {
      fetchPolicy: modalProps.open ? 'network-only' : 'store-only',
    },
  );

  // TODO: Skip permission check due to inaccurate API response. Update when API is fixed.
  const hasNoPermissions = false;

  const legacyFolderExplorerPane = vfolder_node && (
    <BAIFlex direction="column" align="stretch">
      {vfolder_node?.unmanaged_path ? (
        <Alert
          message={t('explorer.NoExplorerSupportForUnmanagedFolder')}
          showIcon
        />
      ) : !hasNoPermissions ? (
        <BAIFileExplorer
          targetVFolderId={vfolderID}
          onUpload={(files: RcFile[], currentPath: string) => {
            uploadFiles(files, vfolderID, currentPath);
          }}
        />
      ) : null}
    </BAIFlex>
  );

  const vfolderDescription = vfolder_node && (
    <VFolderNodeDescription
      vfolderNodeFrgmt={vfolder_node}
      onRequestRefresh={() => {
        folderExplorerRef.current?._fetchVFolder();
      }}
    />
  );

  return (
    <BAIModal
      data-testid="folder-explorer"
      className={styles.baiModalHeader}
      centered
      width={'90%'}
      destroyOnHidden
      footer={null}
      title={
        vfolder_node ? (
          <FolderExplorerHeader
            vfolderNodeFrgmt={vfolder_node}
            folderExplorerRef={folderExplorerRef}
          />
        ) : null
      }
      onCancel={() => {
        onRequestClose();
      }}
      {...modalProps}
    >
      {!vfolder_node ? (
        <Alert
          message={t('explorer.FolderNotFoundOrNoAccess')}
          type="error"
          showIcon
        />
      ) : hasNoPermissions ? (
        <Alert message={t('explorer.NoPermissions')} type="error" showIcon />
      ) : null}
      {vfolder_node ? (
        <Splitter
          // Force re-render component when xl breakpoint changes to reset panel sizes
          // This ensures defaultSize is recalculated based on current screen size
          key={xl ? 'large' : 'small'}
          style={{
            gap: token.size,
            maxHeight: 'calc(100vh - 220px)',
          }}
          layout={xl ? 'horizontal' : 'vertical'}
        >
          <Splitter.Panel resizable={false} max={'60%'}>
            {legacyFolderExplorerPane}
          </Splitter.Panel>
          <Splitter.Panel defaultSize={xl ? 500 : 300} min={300} max={'40%'}>
            {vfolderDescription}
          </Splitter.Panel>
        </Splitter>
      ) : null}
    </BAIModal>
  );
};

export default LegacyFolderExplorer;
