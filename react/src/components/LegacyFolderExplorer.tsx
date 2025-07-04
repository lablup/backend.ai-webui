import { LegacyFolderExplorerQuery } from '../__generated__/LegacyFolderExplorerQuery.graphql';
import { filterEmptyItem, toGlobalId } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FolderExplorerActions from './FolderExplorerActions';
import FolderExplorerHeader from './FolderExplorerHeader';
import VFolderNodeDescription from './VFolderNodeDescription';
import { Alert, Grid, Splitter, theme } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';
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

  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();

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

  // TODO: check default file browser and ssh image from config and filter the image nodes.
  // Else use the installed image nodes with the label "ai.backend.service-ports == filebrowser", "ai.backend.role == SYSTEM".
  const { vfolder_node, fileBrowserImageNodes, sftpImageNodes } =
    useLazyLoadQuery<LegacyFolderExplorerQuery>(
      graphql`
        query LegacyFolderExplorerQuery(
          $vfolderUUID: String!
          $scope_id: ScopeField!
          $fileBrowserFilter: String
          $sftpFilter: String
        ) {
          vfolder_node(id: $vfolderUUID) @since(version: "24.03.4") {
            id
            user
            permission
            unmanaged_path @since(version: "25.04.0")
            ...FolderExplorerHeaderFragment
            ...VFolderNodeDescriptionFragment
            ...VFolderNameTitleNodeFragment
          }
          fileBrowserImageNodes: image_nodes(
            scope_id: $scope_id
            filter: $fileBrowserFilter
          ) {
            edges {
              node {
                id @required(action: THROW)
                labels {
                  key
                  value
                }
                installed @since(version: "25.11.0")
                ...FileBrowserButtonImageNodeFragment
              }
            }
          }
          sftpImageNodes: image_nodes(
            scope_id: $scope_id
            filter: $sftpFilter
          ) {
            edges {
              node {
                id @required(action: THROW)
                labels {
                  key
                  value
                }
                installed @since(version: "25.11.0")
                ...SFTPButtonImageNodeFragment
              }
            }
          }
        }
      `,
      {
        vfolderUUID: toGlobalId('VirtualFolderNode', vfolderID),
        scope_id: `project:${currentProject?.id}`,
        // TODO: find the image nodes with the label "ai.backend.service-ports == filebrowser"
        // fileBrowserFilter:
        // TODO: find the image nodes with the label "ai.backend.role == "SYSTEM"
        // sftpFilter:
      },
      {
        fetchPolicy: modalProps.open ? 'network-only' : 'store-only',
      },
    );

  const installedFileBrowserImageNodes = filterEmptyItem(
    _.map(
      _.filter(fileBrowserImageNodes?.edges, (node) =>
        // For backward compatibility, set default installed value to true.
        _.get(node, 'installed', true),
      ),
      (node) => _.get(node, 'node', null),
    ),
  );

  const installedSFTPImageNodes = filterEmptyItem(
    _.map(
      _.filter(sftpImageNodes?.edges, (node) =>
        // For backward compatibility, set default installed value to true.
        _.get(node, 'installed', true),
      ),
      (node) => _.get(node, 'node', null),
    ),
  );

  const legacyFolderExplorerPane = (
    <Flex direction="column" align="stretch">
      {vfolder_node?.unmanaged_path ? (
        <Alert
          message={t('explorer.NoExplorerSupportForUnmanagedFolder')}
          showIcon
        />
      ) : (
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
      )}
    </Flex>
  );
  const vfolderDescription = (
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
        <FolderExplorerHeader
          folderExplorerRef={folderExplorerRef}
          // Use the first image node as the default file browser image node.
          fileBrowserImageNodesFrgmt={
            installedFileBrowserImageNodes?.[0] || null
          }
          sftpImageNodesFrgmt={installedSFTPImageNodes?.[0] || null}
          vfolderNodeFrgmt={vfolder_node}
        />
      }
      onCancel={() => {
        onRequestClose();
      }}
      {...modalProps}
    >
      {xl ? (
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
      )}
    </BAIModal>
  );
};

export default LegacyFolderExplorer;
