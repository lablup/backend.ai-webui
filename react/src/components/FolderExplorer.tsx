import { FolderExplorerQuery } from '../__generated__/FolderExplorerQuery.graphql';
import BAIModal, { BAIModalProps } from './BAIModal';
import { useFileUploadManager } from './FileUploadManager';
import FolderExplorerHeader from './FolderExplorerHeader';
import VFolderNodeDescription from './VFolderNodeDescription';
import { Alert, Grid, Splitter, theme } from 'antd';
import { createStyles } from 'antd-style';
import { RcFile } from 'antd/es/upload';
import { BAIFileExplorer, BAIFlex, toGlobalId } from 'backend.ai-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useCurrentProjectValue } from 'src/hooks/useCurrentProject';

const useStyles = createStyles(({ token, css }) => ({
  baiModalHeader: css`
    .ant-modal-title {
      width: 100%;
      margin-right: ${token.marginXXL}px;
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

const FolderExplorer: React.FC<FolderExplorerProps> = ({
  vfolderID,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { xl } = Grid.useBreakpoint();
  const { styles } = useStyles();
  const folderExplorerRef = useRef<FolderExplorerElement>(null);
  const { uploadFiles } = useFileUploadManager();
  const currentProject = useCurrentProjectValue();

  const { vfolder_node } = useLazyLoadQuery<FolderExplorerQuery>(
    graphql`
      query FolderExplorerQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) {
          group
          unmanaged_path @since(version: "25.04.0")

          ...FolderExplorerHeaderFragment
          ...VFolderNodeDescriptionFragment
          # VFolderNameTitleNodeFragment is used in FolderExplorerHeader
          ...VFolderNameTitleNodeFragment
          # ControlItemsFragment is used in FileExplorer
          ...BAIFileExplorerFragment
          ...ControlItemsFragment
        }
      }
    `,
    { vfolderGlobalId: toGlobalId('VirtualFolderNode', vfolderID) },
    {
      fetchPolicy: modalProps.open ? 'network-only' : 'store-only',
    },
  );

  // TODO: Skip permission check due to inaccurate API response. Update when API is fixed.
  const hasNoPermissions = false;

  return (
    <BAIModal
      className={styles.baiModalHeader}
      width={'90%'}
      centered
      destroyOnClose
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

        <Splitter
          style={{
            gap: token.size,
            maxHeight: 'calc(100vh - 220px)',
          }}
          layout={xl ? 'horizontal' : 'vertical'}
        >
          <Splitter.Panel resizable={false} max={'60%'}>
            <BAIFlex direction="column" align="stretch">
              {vfolder_node?.unmanaged_path ? (
                <Alert
                  message={t('explorer.NoExplorerSupportForUnmanagedFolder')}
                  showIcon
                />
              ) : !hasNoPermissions ? (
                <>
                  <BAIFileExplorer
                    vfolderNodeFrgmt={vfolder_node}
                    targetVFolderId={vfolderID}
                    onUpload={(
                      files: RcFile[],
                      currentPath: string,
                      refetch: () => void,
                    ) => {
                      uploadFiles(files, vfolderID, currentPath, () => {
                        refetch();
                      });
                    }}
                  />
                  {/* backend-ai-folder-explorer is needed for header actions */}
                  {/* @ts-ignore */}
                  <backend-ai-folder-explorer
                    ref={folderExplorerRef}
                    active
                    vfolderID={vfolderID}
                    style={{ display: 'none' }}
                  />
                </>
              ) : null}
            </BAIFlex>
          </Splitter.Panel>
          <Splitter.Panel max={'40%'}>
            {vfolder_node ? (
              <VFolderNodeDescription
                vfolderNodeFrgmt={vfolder_node}
                onRequestRefresh={() => {
                  folderExplorerRef.current?._fetchVFolder();
                }}
              />
            ) : null}
          </Splitter.Panel>
        </Splitter>
      </BAIFlex>
    </BAIModal>
  );
};

export default FolderExplorer;
