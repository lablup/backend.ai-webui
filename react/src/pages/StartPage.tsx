import ActionItemContent from '../components/ActionItemContent';
import AnnouncementAlert from '../components/AnnouncementAlert';
import BAIAlert from '../components/BAIAlert';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import FolderCreateModal from '../components/FolderCreateModal';
import { MenuKeys } from '../components/MainLayout/WebUISider';
import ThemeSecondaryProvider from '../components/ThemeSecondaryProvider';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useVFolderInvitationsValue } from '../hooks/useVFolderInvitations';
import { SessionLauncherFormValue } from './SessionLauncherPage';
import { AppstoreAddOutlined, FolderAddOutlined } from '@ant-design/icons';
import { filterOutEmpty, BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StartPageBoardItem extends BAIBoardItem {
  requiredMenuKey: MenuKeys;
}

const StartPage: React.FC = () => {
  const { t } = useTranslation();

  const baiClient = useSuspendedBackendaiClient();
  const blockList = baiClient?._config?.blockList ?? [];
  const inactiveList = baiClient?._config?.inactiveList ?? [];
  const enableModelFolders = baiClient?._config?.enableModelFolders ?? false;

  const webuiNavigate = useWebUINavigate();
  const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);

  const { upsertNotification } = useSetBAINotification();
  const { count } = useVFolderInvitationsValue();

  useEffect(() => {
    if (count <= 0) return;
    upsertNotification({
      key: 'invitedFolders',
      message: t('data.InvitedFoldersTooltip', {
        count: count,
      }),
      to: {
        search: new URLSearchParams({
          invitation: 'true',
        }).toString(),
      },
      open: true,
      duration: 0,
    });
  }, [count, t, upsertNotification]);

  const initialBoardItems = filterOutEmpty<StartPageBoardItem>([
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
    enableModelFolders && {
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
  ]).filter(
    (item) =>
      !_.includes([...blockList, ...inactiveList], item.requiredMenuKey),
  );

  const [localStorageBoardItems, setLocalStorageBoardItems] =
    useBAISettingUserState('start_page_board_items');

  // TODO: Issue occurs when newly added items in new webui version are not saved in localStorage
  // and thus not displayed on screen.
  // Opted-out items should also be stored separately in localStorage, and newly added items
  // should be included in initialBoardItems.
  const newlyAddedItems = _.filter(
    initialBoardItems,
    (item) =>
      !_.find(
        localStorageBoardItems,
        (itemInStorage) => itemInStorage.id === item.id,
      ),
  );
  const localstorageBoardItemsWithData = filterOutEmpty(
    _.map(localStorageBoardItems, (item) => {
      const matchedData = _.find(
        initialBoardItems,
        (initialItem) => initialItem.id === item.id,
      )?.data;
      return matchedData ? { ...item, data: matchedData } : undefined;
    }),
  );
  const boardItems = [...localstorageBoardItemsWithData, ...newlyAddedItems];

  return (
    <BAIFlex direction="column" gap={'md'} align="stretch">
      <AnnouncementAlert showIcon closable />
      <BAIBoard
        movable
        items={boardItems}
        onItemsChange={(event) => {
          // use spread operator to ignore readonly type error
          const changedItems = [...event.detail.items];
          setLocalStorageBoardItems(
            _.map(changedItems, (item) => _.omit(item, 'data')),
          );
        }}
      />
      {_.isEmpty(boardItems) && (
        <BAIAlert type="info" description={t('start.NoStartItems')} showIcon />
      )}
      <FolderCreateModal
        open={isOpenCreateModal}
        onRequestClose={(response) => {
          setIsOpenCreateModal(false);
          if (response) {
            webuiNavigate('/data');
          }
        }}
      />
    </BAIFlex>
  );
};

export default StartPage;
