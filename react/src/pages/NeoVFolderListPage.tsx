import BAIStartSimpleCard from '../components/BAIStartSimpleCard';
import Flex from '../components/Flex';
import FolderCreateModal from '../components/FolderCreateModal';
import { localeCompare } from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import NeoStorageQuotaCard from './NeoStorageQuotaCard';
import NeoStorageStatusCard from './NeoStorageStatusCard';
import NeoVFolderList from './NeoVfolderList';
import { FolderAddOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Badge, Button, Card, Tabs, Typography, theme } from 'antd';
import { t } from 'i18next';
import _ from 'lodash';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TAB_ITEMS_MAP = {
  created: t('data.Created'),
  deleted: 'Deleted',
};

const NeoVFolderListPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const deferredFetchKey = useDeferredValue(fetchKey);
  const { data: vfolders } = useSuspenseTanQuery({
    queryKey: ['vfolders', { deferredFetchKey }],
    queryFn: async () => {
      return baiClient.vfolder.list(currentProject?.id).then((res) =>
        _.filter(res, (vfolder) => {
          return ['ready', 'delete-pending'].includes(vfolder.status);
        }).sort((a, b) => localeCompare(a?.name, b?.name)),
      );
    },
  });

  const [openFolderCreateModal, { toggle: toggleOpenCreateModal }] =
    useToggle<boolean>(false);
  const [currentTabKey, setCurrentTabKey] = useState<string>('created');

  return (
    <Flex direction="column" align="stretch" gap={'lg'}>
      <Flex gap={token.marginMD} style={{ width: '100%' }}>
        <BAIStartSimpleCard
          icon={<FolderAddOutlined />}
          title={`Create Folder and \nUpload Files`}
          bordered={false}
          footerButtonProps={{
            onClick: () => {
              toggleOpenCreateModal();
            },
            children: 'Create Folder',
          }}
          styles={{
            body: {
              height: 192,
              width: 194,
            },
          }}
        />
        <NeoStorageStatusCard />
        <NeoStorageQuotaCard style={{ height: 192 }} />
      </Flex>
      <Flex align="stretch" direction="column">
        <Card>
          <Flex justify="between" style={{ marginBottom: 22 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('data.Folders')}
            </Typography.Title>
            <Button
              type="primary"
              onClick={() => {
                toggleOpenCreateModal();
              }}
            >
              Create Folder
            </Button>
          </Flex>
          <Tabs
            type="card"
            defaultValue={currentTabKey}
            onChange={(value) => setCurrentTabKey(value)}
            items={_.map(TAB_ITEMS_MAP, (label, key) => ({
              key,
              label: (
                <Flex style={{ width: 124 }} justify="center" gap={10}>
                  {label}
                  <Badge
                    count={
                      label === 'Created'
                        ? (_.filter(
                            vfolders,
                            (vfolder) => vfolder.status === 'ready',
                          )?.length as number)
                        : (_.filter(
                            vfolders,
                            (vfolder) => vfolder.status === 'delete-pending',
                          )?.length as number)
                    }
                    color={token.colorPrimary}
                  />
                </Flex>
              ),
              children: (
                <NeoVFolderList
                  vfolders={
                    currentTabKey === 'created'
                      ? _.filter(
                          vfolders,
                          (vfolder) => vfolder.status === 'ready',
                        )
                      : _.filter(
                          vfolders,
                          (vfolder) => vfolder.status === 'delete-pending',
                        )
                  }
                />
              ),
            }))}
          />
        </Card>
      </Flex>
      <FolderCreateModal
        open={openFolderCreateModal}
        onRequestClose={() => {
          toggleOpenCreateModal();
        }}
        afterClose={() => {
          updateFetchKey();
        }}
      />
    </Flex>
  );
};

export default NeoVFolderListPage;
