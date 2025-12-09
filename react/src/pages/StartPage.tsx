import ActionItemContent from '../components/ActionItemContent';
import AnnouncementAlert from '../components/AnnouncementAlert';
import BAIAlert from '../components/BAIAlert';
import BAIBoard, { BAIBoardItem } from '../components/BAIBoard';
import FolderCreateModal from '../components/FolderCreateModal';
import StartFromURLModal from '../components/StartFromURLModal';
import ThemeSecondaryProvider from '../components/ThemeSecondaryProvider';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { SessionLauncherFormValue } from './SessionLauncherPage';
import { AppstoreAddOutlined } from '@ant-design/icons';
import {
  filterOutEmpty,
  BAIFlex,
  BAIUnmountAfterClose,
  BAIURLStartIcon,
  BAIInteractiveSessionIcon,
  BAIBatchSessionIcon,
  BAINewFolderIcon,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect, useState, useMemo, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useVFolderInvitations } from 'src/hooks/useVFolderInvitations';
import { MenuKeys } from 'src/hooks/useWebUIMenuItems';
import {
  useQueryParams,
  withDefault,
  StringParam,
  JsonParam,
} from 'use-query-params';

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
  const [isOpenStartURLModal, setIsOpenStartURLModal] =
    useState<boolean>(false);

  const location = useLocation();

  // State for modal initial data
  const [startModalInitialProps, setStartModalInitialProps] = useState<{
    initialTab?: 'notebook' | 'github' | 'gitlab';
    initialData?: { url?: string; branch?: string };
  }>();

  const { upsertNotification } = useSetBAINotification();
  const [vFolderInvitations] = useVFolderInvitations();

  // Parse query parameters
  const [queryParams, setQueryParams] = useQueryParams({
    type: withDefault(StringParam, undefined),
    data: withDefault(JsonParam, undefined),
  });

  // Handle legacy GitHub URL format (for backward compatibility)
  const legacyGithubPath = useMemo(() => {
    // Check for legacy /github? URL format
    const pathAfterGithub = location.search.substring(1); // Remove the '?'

    // If we have a query string without 'type' param, it might be legacy format
    if (
      !queryParams.type &&
      pathAfterGithub &&
      !pathAfterGithub.includes('=')
    ) {
      return pathAfterGithub;
    }
    return null;
  }, [location.search, queryParams.type]);

  const badgeEventHandler = useEffectEvent(() => {
    // Handle new format: /start?type=url&data=...
    if (queryParams.type === 'url' && queryParams.data) {
      setStartModalInitialProps({
        initialTab: 'notebook',
        initialData: queryParams.data,
      });
      setIsOpenStartURLModal(true);

      setQueryParams({
        type: undefined,
        data: undefined,
      });
    } else if (legacyGithubPath) {
      // Handle legacy format: /github?owner/repo/path/notebook.ipynb (via redirect)
      // Convert legacy path to full URL
      const fullUrl = `https://github.com/${legacyGithubPath}`;
      setStartModalInitialProps({
        initialTab: 'notebook',
        initialData: { url: fullUrl },
      });
      setIsOpenStartURLModal(true);

      // clear legacy query parameter
      setQueryParams(
        {
          type: undefined,
          data: undefined,
        },
        // clear legacy query parameter
        'replace',
      );
    }
  });

  useEffect(() => {
    badgeEventHandler();
  }, []);

  useEffect(() => {
    if (vFolderInvitations.length <= 0) return;
    upsertNotification({
      key: 'invitedFolders',
      message: t('data.InvitedFoldersTooltip', {
        count: vFolderInvitations.length,
      }),
      to: {
        search: new URLSearchParams({
          invitation: 'true',
        }).toString(),
      },
      open: true,
      duration: 0,
    });
  }, [vFolderInvitations.length, t, upsertNotification]);

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
            icon={<BAINewFolderIcon />}
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
            icon={<BAIInteractiveSessionIcon />}
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
            icon={<BAIBatchSessionIcon />}
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
    {
      id: 'importFromURL',
      requiredMenuKey: 'import',
      rowSpan: 3,
      columnSpan: 1,
      columnOffset: { 6: 3, 4: 3 },
      data: {
        content: (
          <ActionItemContent
            title={t('start.StartFromURL')}
            description={t('start.StartFromURLDesc')}
            buttonText={t('start.button.StartNow')}
            icon={<BAIURLStartIcon />}
            onClick={() => {
              setIsOpenStartURLModal(true);
            }}
          />
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
      <BAIUnmountAfterClose>
        <FolderCreateModal
          open={isOpenCreateModal}
          onRequestClose={(response) => {
            setIsOpenCreateModal(false);
            if (response) {
              webuiNavigate('/data');
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <StartFromURLModal
          open={isOpenStartURLModal}
          onCancel={() => {
            setIsOpenStartURLModal(false);
            setStartModalInitialProps(undefined);
          }}
          initialTab={startModalInitialProps?.initialTab}
          initialData={startModalInitialProps?.initialData}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default StartPage;
