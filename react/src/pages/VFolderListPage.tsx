import Flex from '../components/Flex';
import InviteFolderPermissionSettingModal from '../components/InviteFolderPermissionSettingModal';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Skeleton, theme } from 'antd';
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
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });
  const baiClient = useSuspendedBackendaiClient();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const dataViewRef = useRef(null);
  const [inviteFolderId, setInviteFolderId] = useState<string | null>(null);

  const { token } = theme.useToken();

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
    {
      key: 'model',
      tab: t('data.Models'),
    },
    baiClient.supports('model-store') &&
      baiClient._config.enableModelStore && {
        key: 'model-store',
        tab: t('data.ModelStore'),
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // @ts-ignore
              dataViewRef.current?.openAddFolderDialog();
            }}
          >
            {t('data.Add')}
          </Button>
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
      <InviteFolderPermissionSettingModal
        onRequestClose={() => {
          setInviteFolderId(null);
        }}
        vfolderId={inviteFolderId}
        open={inviteFolderId !== null}
      />
    </Flex>
  );
};

export default VFolderListPage;
