import ActionItemContent from '../components/ActionItemContent';
import AnnouncementAlert from '../components/AnnouncementAlert';
import BAIAlert from '../components/BAIAlert';
import Flex from '../components/Flex';
import FolderCreateModal from '../components/FolderCreateModal';
import { MenuKeys } from '../components/MainLayout/WebUISider';
import ThemeSecondaryProvider from '../components/ThemeSecondaryProvider';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { SessionLauncherFormValue } from './SessionLauncherPage';
import { AppstoreAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import { Card, Col, Row } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const StartPage: React.FC = () => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();
  const blockList = baiClient?._config?.blockList ?? [];
  const inactiveList = baiClient?._config?.inactiveList ?? [];

  const webuiNavigate = useWebUINavigate();
  const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);

  const items = filterEmptyItem<{
    id: string;
    requiredMenuKey: MenuKeys;
    rowSpan: number;
    columnSpan: number;
    columnOffset: Record<number, number>;
    data: {
      content: React.ReactNode;
    };
  }>([
    {
      id: 'createFolder',
      requiredMenuKey: 'data',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 0, 4: 0 },
      data: {
        content: (
          <ActionItemContent
            title={t('start.CreateFolder')}
            description={t('start.CreateFolderDesc')}
            buttonText={t('start.button.CreateFolder')}
            icon={<FolderAddOutlined />}
            onClick={() => setIsOpenCreateModal(true)}
          />
        ),
      },
    },
    {
      id: 'startSession',
      requiredMenuKey: 'job',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 1, 4: 1 },
      data: {
        content: (
          <ActionItemContent
            title={t('start.StartSession')}
            description={t('start.StartSessionDesc')}
            buttonText={t('start.button.StartSession')}
            icon={<AppstoreAddOutlined />}
            onClick={() => webuiNavigate('/session/start')}
          />
        ),
      },
    },
    {
      id: 'startBatchSession',
      requiredMenuKey: 'job',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 2, 4: 2 },
      data: {
        content: (
          <ActionItemContent
            title={t('start.StartBatchSession')}
            description={t('start.StartBatchSessionDesc')}
            buttonText={t('start.button.StartSession')}
            icon={<AppstoreAddOutlined />}
            onClick={() => {
              const launcherValue: DeepPartial<SessionLauncherFormValue> = {
                sessionType: 'batch',
              };
              const params = new URLSearchParams();
              params.set('step', '0');
              params.set('formValues', JSON.stringify(launcherValue));
              webuiNavigate(`/session/start?${params.toString()}`);
            }}
          />
        ),
      },
    },
    {
      id: 'modelService',
      rowSpan: 3,
      requiredMenuKey: 'serving',
      columnSpan: 1,
      columnOffset: { 6: 0, 4: 0 },
      data: {
        content: (
          <ThemeSecondaryProvider>
            <ActionItemContent
              title={t('start.ModelService')}
              description={t('start.ModelServiceDesc')}
              buttonText={t('start.button.ModelService')}
              icon={<AppstoreAddOutlined />}
              onClick={() => webuiNavigate('/service/start')}
            />
          </ThemeSecondaryProvider>
        ),
      },
    },
    // {
    //   id: 'startFromURL',
    //   rowSpan: 3,
    //   columnSpan: 1,
    //   columnOffset: { 6: 1, 4: 1 },
    //   data: {
    //     content: (
    //       <ThemeSecondaryProvider>
    //         <ActionItemContent
    //           title={t('start.StartFromURL')}
    //           description={t('start.StartFromURLDesc')}
    //           buttonText={t('start.button.StartNow')}
    //           icon={<LinkOutlined />}
    //           onClick={() => webuiNavigate('/import')}
    //         />
    //       </ThemeSecondaryProvider>
    //     ),
    //   },
    // },
    // {
    //   id: 'startFromExample',
    //   rowSpan: 3,
    //   columnSpan: 1,
    //   columnOffset: { 6:2, 4: 2 },
    //   data: {
    //     content: (
    //       <ThemeSecondaryProvider>
    //         <ActionItemContent
    //           title={t('start.StartFromExample')}
    //           description={t('start.StartFromExampleDesc')}
    //           buttonText={t('start.button.StartNow')}
    //           icon={<PlaySquareOutlined />}
    //           onClick={() => webuiNavigate('/import')}
    //         />
    //       </ThemeSecondaryProvider>
    //     ),
    //   },
    // },
  ]).filter(
    (item) =>
      !_.includes(blockList, item.requiredMenuKey) &&
      !_.includes(inactiveList, item.requiredMenuKey),
  );

  return (
    <Flex direction="column" gap={'md'} align="stretch">
      {/* <BAIBoard
        items={items}
        onItemsChange={(event) => {
          // use spread operator to ignore readonly type error
          const changedItems = [...event.detail.items];
          setItems(changedItems);
          setItemSettings(_.map(changedItems, (item) => _.omit(item, 'data')));
        }}
      /> */}
      <AnnouncementAlert showIcon closable />
      {_.isEmpty(items) && (
        <BAIAlert type="info" description={t('start.NoStartItems')} showIcon />
      )}
      <Row gutter={[16, 16]}>
        {_.map(items, (item, idx) => {
          return (
            <Col key={item.id} xs={24} md={12} xl={6}>
              <Card
                style={{ height: 340 }}
                styles={{
                  body: {
                    height: '100%',
                    padding: 0,
                  },
                }}
              >
                {item.data.content}
              </Card>
            </Col>
          );
        })}
      </Row>
      <FolderCreateModal
        open={isOpenCreateModal}
        onRequestClose={(response) => {
          setIsOpenCreateModal(false);
          if (response) {
            webuiNavigate('/data');
          }
        }}
      />
    </Flex>
  );
};

export default StartPage;
