import ActionItemContent from '../components/ActionItemContent';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import FolderCreateModal from '../components/FolderCreateModal';
import ThemeSecondaryProvider from '../components/ThemeSecondaryProvider';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { SessionLauncherFormValue } from './SessionLauncherPage';
import {
  AppstoreAddOutlined,
  FolderAddOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const StartPage: React.FC = () => {
  const { t } = useTranslation();

  // to avoid flickering
  useSuspendedBackendaiClient();

  const webuiNavigate = useWebUINavigate();

  const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);

  const [itemSettings, setItemSettings] =
    useBAISettingUserState('start_board_items');

  const [items, setItems] = useState<Array<BAIBoardItem>>(() => {
    const defaultItems: Array<BAIBoardItem> = [
      {
        id: 'createFolder',
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
      {
        id: 'startFromURL',
        rowSpan: 3,
        columnSpan: 1,
        columnOffset: { 6: 1, 4: 1 },
        data: {
          content: (
            <ThemeSecondaryProvider>
              <ActionItemContent
                title={t('start.StartFromURL')}
                description={t('start.StartFromURLDesc')}
                buttonText={t('start.button.StartNow')}
                icon={<LinkOutlined />}
                onClick={() => webuiNavigate('/import')}
              />
            </ThemeSecondaryProvider>
          ),
        },
      },
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
    ];

    if (itemSettings) {
      return defaultItems.map((item) => {
        const savedSetting = itemSettings.find(
          (setting) => setting.id === item.id,
        );
        return savedSetting ? { ...item, ...savedSetting } : item;
      });
    }

    return defaultItems;
  });

  return (
    <>
      <BAIBoard
        items={items}
        onItemsChange={(event) => {
          // use spread operator to ignore readonly type error
          const changedItems = [...event.detail.items];
          setItems(changedItems);
          setItemSettings(_.map(changedItems, (item) => _.omit(item, 'data')));
        }}
      />
      <FolderCreateModal
        open={isOpenCreateModal}
        onRequestClose={(response) => {
          setIsOpenCreateModal(false);
          if (response) {
            webuiNavigate('/data');
          }
        }}
      />
    </>
  );
};
export default StartPage;
