import { LegacyFolderExplorerQuery } from '../__generated__/LegacyFolderExplorerQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FolderExplorerActions from './FolderExplorerActions';
import FolderExplorerHeader from './FolderExplorerHeader';
import VFolderNodeDescription from './VFolderNodeDescription';
import { Alert, Grid, Splitter, theme } from 'antd';
import { createStyles } from 'antd-style';
import { toGlobalId } from 'backend.ai-ui';
import { useEffect, useRef, useState } from 'react';
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

  const { t } = useTranslation();
  const [isWritable, setIsWritable] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  // TODO: Events are sent and received as normal,
  // but the Lit Element is not rendered and the values inside are not available but ref is available.
  const folderExplorerRef = useRef<FolderExplorerElement>(null);

  // ensure the client is connected
  useSuspendedBackendaiClient();
  useEffect(() => {
    const handleConnected = (e: any) => {
      setIsWritable(e.detail || false);
    };

    const handleColumnSelected = (e: any) => {
      setIsSelected(e.detail || false);
    };

    document.addEventListener('folderExplorer:connected', handleConnected);
    document.addEventListener(
      'folderExplorer:columnSelected',
      handleColumnSelected,
    );
    return () => {
      document.removeEventListener('folderExplorer:connected', handleConnected);
      document.removeEventListener(
        'folderExplorer:columnSelected',
        handleColumnSelected,
      );
    };
  }, []);

  const { vfolder_node } = useLazyLoadQuery<LegacyFolderExplorerQuery>(
    graphql`
      query LegacyFolderExplorerQuery($vfolderGlobalId: String!) {
        vfolder_node(id: $vfolderGlobalId) @since(version: "24.03.4") {
          id
          user
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
  // !vfolder_node || (vfolder_node.permissions?.length || 0) === 0;

  const legacyFolderExplorerPane = vfolder_node && (
    <Flex direction="column" align="stretch">
      {vfolder_node?.unmanaged_path ? (
        <Alert
          message={t('explorer.NoExplorerSupportForUnmanagedFolder')}
          showIcon
        />
      ) : !hasNoPermissions ? (
        <>
          <FolderExplorerActions
            isSelected={isSelected}
            isWritable={isWritable}
            folderExplorerRef={folderExplorerRef}
            size={xl ? 'default' : 'small'}
          />
          {/* @ts-ignore */}
          <backend-ai-folder-explorer
            ref={folderExplorerRef}
            active
            vfolderID={vfolderID}
          />
        </>
      ) : null}
    </Flex>
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
      className={styles.baiModalHeader}
      centered
      width={'90%'}
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
        xl ? (
          <Splitter
            style={{
              gap: token.size,
              alignSelf: 'stretch',
            }}
          >
            <Splitter.Panel resizable={false}>
              {legacyFolderExplorerPane}
            </Splitter.Panel>
            <Splitter.Panel defaultSize={500} min={300} max={'40%'}>
              {vfolderDescription}
            </Splitter.Panel>
          </Splitter>
        ) : (
          <Flex direction="column" align="stretch" gap={'md'}>
            {legacyFolderExplorerPane}
            {vfolderDescription}
          </Flex>
        )
      ) : null}
    </BAIModal>
  );
};

export default LegacyFolderExplorer;
