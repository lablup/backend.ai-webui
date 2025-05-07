import { toGlobalId } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { usePainKiller } from '../hooks/usePainKiller';
import BAIModal, { BAIModalProps } from './BAIModal';
import BAISelect from './BAISelect';
import Flex from './Flex';
import VFolderNodeDescription from './VFolderNodeDescription';
import { LegacyFolderExplorerPermissionRefreshQuery } from './__generated__/LegacyFolderExplorerPermissionRefreshQuery.graphql';
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
  App,
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
import {
  useLazyLoadQuery,
  useFragment,
  fetchQuery,
  useRelayEnvironment,
} from 'react-relay';

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
  const { message } = App.useApp();
  const [currentUser] = useCurrentUserInfo();

  const [isWritable, setIsWritable] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  // Use a state because the Splitter component has an issue with defaultSize not working properly when refreshing.
  const [sizes, setSizes] = useState<Array<string | number>>(['60%', '40%']);
  // TODO: Events are sent and received as normal,
  // but the Lit Element is not rendered and the values inside are not available but ref is available.
  const folderExplorerRef = useRef<HTMLDivElement>(null);
  const baiClient = useSuspendedBackendaiClient();
  const painKiller = usePainKiller();
  const relayEnv = useRelayEnvironment();

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

  const permission = vfolder_node?.permission || vfolder?.permission;

  const updateMutation = useTanMutation({
    mutationFn: ({ permission, id }: { permission: string; id: string }) => {
      return baiClient.vfolder.update_folder({ permission }, id);
    },
  });

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
              </>
            ) : null}
            {vfolder_node?.user === currentUser.uuid && (
              <BAISelect
                tooltip={t('data.folders.MountPermission')}
                defaultValue={permission === 'wd' ? 'rw' : permission}
                options={[
                  { value: 'ro', label: t('data.ReadOnly') },
                  { value: 'rw', label: t('data.ReadWrite') },
                ]}
                onChange={(value) => {
                  updateMutation.mutate(
                    { permission: value, id: vfolderID },
                    {
                      onSuccess: () => {
                        message.success(
                          t('data.permission.PermissionModified'),
                        );
                        document.dispatchEvent(
                          new CustomEvent('backend-ai-folder-updated'),
                        );

                        // To update GraphQL relay node
                        fetchQuery<LegacyFolderExplorerPermissionRefreshQuery>(
                          relayEnv,
                          graphql`
                            query LegacyFolderExplorerPermissionRefreshQuery(
                              $id: String!
                            ) {
                              vfolder_node(id: $id) {
                                permission
                                permissions
                              }
                            }
                          `,
                          {
                            id: vfolder_node.id,
                          },
                        ).toPromise();
                        // @ts-ignore
                        folderExplorerRef.current?._fetchVFolder();
                      },
                      onError: (error) => {
                        message.error(painKiller.relieve(error?.message));
                      },
                    },
                  );
                }}
                popupMatchSelectWidth={false}
              />
            )}
          </Flex>
        </Flex>
      }
      onCancel={() => {
        onRequestClose();
      }}
      styles={{
        body: {
          minHeight: '475px',
          height: sizes[sizes.length - 1] === 0 ? 475 : undefined,
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
          <Splitter.Panel size={sizes[0]} style={{ position: 'relative' }}>
            <Flex
              justify="end"
              gap={token.marginSM}
              style={{
                position: 'absolute',
                right: 0,
              }}
            >
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
          <VFolderNodeDescription vfolderNodeFrgmt={vfolder_node} />
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
