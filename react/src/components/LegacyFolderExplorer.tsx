import { formatToUUID } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { LegacyFolderExplorerVFolderNameTitleQuery } from './__generated__/LegacyFolderExplorerVFolderNameTitleQuery.graphql';
import {
  DeleteOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Grid,
  Image,
  Skeleton,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

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

const LegacyFolderExplorer: React.FC<LegacyFolderExplorerProps> = ({
  vfolderID,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();
  const { lg } = Grid.useBreakpoint();
  const [isWritable, setIsWritable] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  // TODO: Events are sent and received as normal,
  // but the Lit Element is not rendered and the values inside are not available but ref is available.
  const folderExplorerRef = useRef<HTMLDivElement>(null);
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

  return (
    <BAIModal
      className={styles.baiModalHeader}
      centered
      width={1200}
      destroyOnClose
      footer={null}
      title={
        <Flex justify="between" gap={token.marginMD} style={{ width: '100%' }}>
          <Flex gap={token.marginMD} style={{ flex: 1 }}>
            <Suspense fallback={<Skeleton.Input active />}>
              <VFolderNameTitle vfolderID={vfolderID} />
            </Suspense>
          </Flex>
          <Flex justify="end" gap={token.marginSM} style={{ flex: lg ? 2 : 1 }}>
            <Button
              danger
              disabled={!isSelected || !isWritable}
              icon={<DeleteOutlined />}
              onClick={() => {
                // @ts-ignore
                folderExplorerRef.current?._openDeleteMultipleFileDialog();
              }}
            >
              {lg && t('button.Delete')}
            </Button>
            <Button
              disabled={!isWritable}
              icon={<FolderAddOutlined />}
              onClick={() => {
                //@ts-ignore
                folderExplorerRef.current?.openMkdirDialog();
              }}
            >
              {lg && t('button.Create')}
            </Button>
            <Dropdown
              disabled={!isWritable}
              menu={{
                items: [
                  {
                    key: 'upload files',
                    label: t('data.explorer.UploadFiles'),
                    icon: <FileAddOutlined />,
                    onClick: () => {
                      // @ts-ignore
                      folderExplorerRef.current?.handleUpload('file');
                    },
                  },
                  {
                    key: 'upload folder',
                    label: t('data.explorer.UploadFolder'),
                    icon: <FolderAddOutlined />,
                    onClick: () => {
                      // @ts-ignore
                      folderExplorerRef.current?.handleUpload('folder');
                    },
                  },
                ],
              }}
            >
              <Button icon={<UploadOutlined />}>{lg && 'Upload'}</Button>
            </Dropdown>
            <Button
              icon={
                <Image
                  width="18px"
                  src="/resources/icons/filebrowser.svg"
                  alt="File Browser"
                  preview={false}
                />
              }
              onClick={() =>
                // @ts-ignore
                folderExplorerRef.current?._executeFileBrowser()
              }
            >
              {lg && t('data.explorer.ExecuteFileBrowser')}
            </Button>
            <Button
              icon={
                <Image
                  width="18px"
                  src="/resources/icons/sftp.png"
                  alt="SSH / SFTP"
                  preview={false}
                />
              }
              onClick={() => {
                // @ts-ignore
                folderExplorerRef.current?._executeSSHProxyAgent();
              }}
            >
              {lg && t('data.explorer.RunSSH/SFTPserver')}
            </Button>
          </Flex>
        </Flex>
      }
      onCancel={() => {
        onRequestClose();
      }}
      {...modalProps}
    >
      {/* <script type="module" src="./dist/components/backend-ai-folder-explorer.js"></script> */}
      {/* @ts-ignore */}
      <backend-ai-folder-explorer
        ref={folderExplorerRef}
        active
        vfolderID={vfolderID}
        style={{ width: '100%' }}
      />
    </BAIModal>
  );
};

const VFolderNameTitle: React.FC<{
  vfolderID: string;
}> = ({ vfolderID }) => {
  const { token } = theme.useToken();
  const { vfolder, vfolder_node } =
    useLazyLoadQuery<LegacyFolderExplorerVFolderNameTitleQuery>(
      graphql`
        query LegacyFolderExplorerVFolderNameTitleQuery(
          $vfolderID: String!
          $vfolderUUID: String!
        ) {
          # TODO: version compatibility
          vfolder(id: $vfolderID) @deprecatedSince(version: "24.03.4") {
            id
            name
          }
          vfolder_node(id: $vfolderUUID) @since(version: "24.03.4") {
            id
            name
          }
        }
      `,
      {
        vfolderID,
        vfolderUUID: btoa('VirtualFolderNode:' + formatToUUID(vfolderID)),
      },
      {
        fetchPolicy: 'store-and-network',
      },
    );

  const vfolderName = vfolder?.name || vfolder_node?.name || '';
  return (
    <Tooltip title={vfolderName}>
      <Typography.Title
        level={3}
        style={{ marginTop: token.marginSM }}
        ellipsis
      >
        {vfolderName}
      </Typography.Title>
    </Tooltip>
  );
};

export default LegacyFolderExplorer;
