import Flex from '../components/Flex';
import FolderCreateModal from '../components/FolderCreateModal';
import ImportFromHuggingFaceModal from '../components/ImportFromHuggingFaceModal';
import InviteFolderSettingModal from '../components/InviteFolderSettingModal';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import {
  DeleteOutlined,
  ImportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Alert, Button, Card, Skeleton, theme } from 'antd';
import _ from 'lodash';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const ModelStoreListPage = React.lazy(() => import('./ModelStoreListPage'));
const StorageStatusPanel = React.lazy(
  () => import('../components/StorageStatusPanel'),
);
const StorageStatusPanelFallback = React.lazy(() =>
  import('../components/StorageStatusPanel').then((m) => ({
    default: m.StorageStatusPanelFallback,
  })),
);

type TabKey =
  | 'general'
  | 'data'
  | 'automount'
  | 'model'
  | 'model-store'
  | 'trash-bin';

interface VFolderListPageProps {}

const tabParam = withDefault(StringParam, 'general');

const VFolderListPage: React.FC<VFolderListPageProps> = (props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [isOpenCreateModal, { toggle: openCreateModal }] = useToggle(false);
  const [inviteFolderId, setInviteFolderId] = useState<string | null>(null);
  const [
    isVisibleImportFromHuggingFaceModal,
    { toggle: toggleImportFromHuggingFaceModal },
  ] = useToggle(false);

  const dataViewRef = useRef(null);
  const baiClient = useSuspendedBackendaiClient();
  const enableImportFromHuggingFace =
    baiClient._config.enableImportFromHuggingFace;

  useEffect(() => {
    const handler = () => {
      updateFetchKey();
    };
    document.addEventListener('backend-ai-folder-list-changed', handler);
    return () => {
      document.removeEventListener('backend-ai-folder-list-changed', handler);
    };
  }, [updateFetchKey]);

  useEffect(() => {
    const handler = (event: any) => {
      setInviteFolderId(event.detail);
    };
    document.addEventListener('show-invite-folder-permission-setting', handler);
    return () => {
      document.removeEventListener(
        'show-invite-folder-permission-setting',
        handler,
      );
    };
  }, [setInviteFolderId]);

  const tabBannerText = {
    data: t('data.DialogDataFolder'),
    automount: t('data.DialogFolderStartingWithDotAutomount'),
    model: t('data.DialogModelFolder'),
  }[curTabKey];

  const tabList = filterEmptyItem([
    {
      key: 'general',
      tab: t('data.Folders'),
    },
    {
      key: 'data',
      tab: t('data.Pipeline'),
    },
    {
      key: 'automount',
      tab: t('data.AutomountFolders'),
    },
    baiClient._config.enableModelFolders && {
      key: 'model',
      tab: t('data.Models'),
    },
    baiClient.supports('vfolder-trash-bin') && {
      key: 'trash-bin',
      tab: <DeleteOutlined />,
    },
  ]);
  return (
    <Flex direction="column" align="stretch" gap={'md'}>
      <Suspense fallback={<StorageStatusPanelFallback />}>
        <StorageStatusPanel fetchKey={fetchKey} />
      </Suspense>
      <Card
        activeTabKey={curTabKey}
        onTabChange={(key) => {
          setCurTabKey(key as TabKey);
        }}
        tabList={tabList}
        styles={{
          body: {
            padding: 0,
            paddingTop: 1,
            overflow: 'hidden',
          },
        }}
        tabBarExtraContent={
          <Flex gap="xs">
            {_.includes(['model', 'model-store'], curTabKey) &&
            enableImportFromHuggingFace ? (
              <Button
                icon={<ImportOutlined />}
                onClick={toggleImportFromHuggingFaceModal}
              >
                {t('data.modelStore.ImportFromHuggingFace')}
              </Button>
            ) : null}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                openCreateModal();
                // @ts-ignore
                // dataViewRef.current?.openAddFolderDialog();
              }}
            >
              {t('data.Add')}
            </Button>
          </Flex>
        }
      >
        {tabBannerText ? (
          <Alert icon={<></>} banner type="info" message={tabBannerText} />
        ) : null}
        {curTabKey === 'model-store' ? (
          <Suspense
            fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
          >
            <ModelStoreListPage />
          </Suspense>
        ) : null}
        {/* @ts-ignore  */}
        <backend-ai-data-view ref={dataViewRef} active _activeTab={curTabKey} />
      </Card>
      <InviteFolderSettingModal
        onRequestClose={() => {
          setInviteFolderId(null);
        }}
        vfolderId={inviteFolderId}
        open={inviteFolderId !== null}
      />
      <ImportFromHuggingFaceModal
        open={isVisibleImportFromHuggingFaceModal}
        onRequestClose={() => {
          toggleImportFromHuggingFaceModal();
        }}
      />
      <FolderCreateModal
        open={isOpenCreateModal}
        onRequestClose={() => openCreateModal()}
      />
    </Flex>
  );
};

export default VFolderListPage;
