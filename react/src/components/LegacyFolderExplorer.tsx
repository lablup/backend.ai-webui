import { toGlobalId } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import VFolderNodeDescription from './VFolderNodeDescription';
import { LegacyFolderExplorerQuery } from './__generated__/LegacyFolderExplorerQuery.graphql';
import { LegacyFolderExplorerVFolderFragment$key } from './__generated__/LegacyFolderExplorerVFolderFragment.graphql';
import { LegacyFolderExplorerVFolderNodeFragment$key } from './__generated__/LegacyFolderExplorerVFolderNodeFragment.graphql';
import {
  DeleteOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Dropdown,
  Grid,
  Image,
  Skeleton,
  Splitter,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import { createStyles } from 'antd-style';
import graphql from 'babel-plugin-relay/macro';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useFragment } from 'react-relay';

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
  // Use a state because the Splitter component has an issue with defaultSize not working properly when refreshing.
  const [sizes, setSizes] = useState<Array<string | number>>(['60%', '40%']);
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

  const { vfolder, vfolder_node } = useLazyLoadQuery<LegacyFolderExplorerQuery>(
    graphql`
      query LegacyFolderExplorerQuery(
        $vfolderID: String
        $vfolderUUID: String!
      ) {
        vfolder(id: $vfolderID) @deprecatedSince(version: "24.03.4") {
          id
          permission
          ...LegacyFolderExplorerVFolderFragment
        }
        vfolder_node(id: $vfolderUUID) @since(version: "24.03.4") {
          id
          user
          permission
          unmanaged_path @since(version: "25.04.0")
          ...LegacyFolderExplorerVFolderNodeFragment
          ...VFolderNodeDescriptionFragment
        }
      }
    `,
    {
      vfolderID,
      vfolderUUID: toGlobalId('VirtualFolderNode', vfolderID),
    },
    {
      fetchPolicy: modalProps.open ? 'network-only' : 'store-only',
    },
  );

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
              <VFolderNameTitle
                vfolderFrgmt={vfolder ?? undefined}
                vfolderNodeFrgmt={vfolder_node ?? undefined}
              />
            </Suspense>
          </Flex>
          <Flex
            justify="end"
            gap={token.marginSM}
            style={{
              flex: lg ? 2 : 1,
            }}
          >
            {!vfolder_node?.unmanaged_path ? (
              <>
                <Tooltip title={!lg && t('data.explorer.ExecuteFileBrowser')}>
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
                </Tooltip>
                <Tooltip title={!lg && t('data.explorer.RunSSH/SFTPserver')}>
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
                </Tooltip>
              </>
            ) : null}
          </Flex>
        </Flex>
      }
      onCancel={() => {
        onRequestClose();
      }}
      styles={{
        body: {
          minHeight: token.screenXSMax,
          // Set height to avoid the modal from growing too large when description is collapsed
          height: sizes[sizes.length - 1] === 0 ? token.screenXSMax : undefined,
        },
      }}
      {...modalProps}
    >
      <Splitter
        layout={lg ? 'horizontal' : 'vertical'}
        style={{ gap: token.size, maxHeight: 'calc(100vh - 200px)' }}
        onResize={setSizes}
      >
        {vfolder_node?.unmanaged_path ? (
          <Splitter.Panel size={sizes[0]}>
            <Alert
              message={t('explorer.NoExplorerSupportForUnmanagedFolder')}
              showIcon
            />
          </Splitter.Panel>
        ) : (
          <Splitter.Panel
            size={sizes[0]}
            min={lg ? 400 : undefined}
            style={{ position: 'relative' }}
          >
            <Flex
              justify="end"
              gap={token.marginSM}
              style={{
                right: 0,
              }}
            >
              <Tooltip title={!lg && t('button.Delete')}>
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
              </Tooltip>
              <Tooltip title={!lg && t('button.Create')}>
                <Button
                  disabled={!isWritable}
                  icon={<FileAddOutlined />}
                  onClick={() => {
                    // @ts-ignore
                    folderExplorerRef.current?.openCreateFileDialog();
                  }}
                >
                  {lg && t('button.Create')}
                </Button>
              </Tooltip>
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
                <Tooltip title={!lg && t('button.Upload')}>
                  <Button disabled={!isWritable} icon={<UploadOutlined />}>
                    {lg && t('button.Upload')}
                  </Button>
                </Tooltip>
              </Dropdown>
            </Flex>
            {/* <script type="module" src="./dist/components/backend-ai-folder-explorer.js"></script> */}
            {/* @ts-ignore */}
            <backend-ai-folder-explorer
              ref={folderExplorerRef}
              active
              vfolderID={vfolderID}
            />
          </Splitter.Panel>
        )}
        <Splitter.Panel
          size={sizes[1]}
          min={lg ? 400 : undefined}
          // FIXME: Antd Splitter bug: Splitter with vertical layout continuously changes panel size upon repeated collapses
          // issue: https://github.com/ant-design/ant-design/issues/53751//
          collapsible={lg ? true : false}
        >
          <VFolderNodeDescription
            vfolderNodeFrgmt={vfolder_node}
            onRequestRefresh={() => {
              // @ts-ignore
              folderExplorerRef.current?._fetchVFolder();
            }}
          />
        </Splitter.Panel>
      </Splitter>
    </BAIModal>
  );
};

const VFolderNameTitle: React.FC<{
  vfolderFrgmt?: LegacyFolderExplorerVFolderFragment$key;
  vfolderNodeFrgmt?: LegacyFolderExplorerVFolderNodeFragment$key;
}> = ({ vfolderFrgmt, vfolderNodeFrgmt, ...props }) => {
  const { token } = theme.useToken();

  const vfolder = useFragment(
    graphql`
      fragment LegacyFolderExplorerVFolderFragment on VirtualFolder {
        id
        name
      }
    `,
    vfolderFrgmt,
  );

  const vfolderNode = useFragment(
    graphql`
      fragment LegacyFolderExplorerVFolderNodeFragment on VirtualFolderNode {
        id
        name
      }
    `,
    vfolderNodeFrgmt,
  );
  const vfolderName = vfolderNode?.name || vfolder?.name || '';

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
