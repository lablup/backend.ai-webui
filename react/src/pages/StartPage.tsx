import ActionItemContent from '../components/ActionItemContent';
import BAIBoard from '../components/BAIBoard';
import { SessionLauncherPageLocationState } from '../components/LocationStateBreadCrumb';
import { useWebUINavigate } from '../hooks';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { SessionLauncherFormValue } from './SessionLauncherPage';
import {
  AppstoreAddOutlined,
  FolderAddOutlined,
  LinkOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons';
import { BoardProps } from '@cloudscape-design/board-components/board';
import { theme } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface StartItem
  extends BoardProps.Item<{
    content: JSX.Element;
  }> {
  id:
    | 'createFolder'
    | 'startSession'
    | 'startBatchSession'
    | 'modelService'
    | 'startFromExample'
    | 'startFromURL';
}

const StartPage: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  const defaultSummaryElements: {
    [key in StartItem['id']]: StartItem['data'];
  } = {
    createFolder: {
      content: (
        <ActionItemContent
          title={t('start.CreateFolder')}
          description={t('start.CreateFolderDesc')}
          buttonText={t('start.button.CreateFolder')}
          icon={
            <FolderAddOutlined
              style={{
                fontSize: token.fontSizeHeading3,
                color: token.colorPrimary,
              }}
            />
          }
          onClick={() => webuiNavigate('/data')}
        />
      ),
    },
    startSession: {
      content: (
        <ActionItemContent
          title={t('start.StartSession')}
          description={t('start.StartSessionDesc')}
          buttonText={t('start.button.StartSession')}
          icon={
            <AppstoreAddOutlined
              style={{
                fontSize: token.fontSizeHeading3,
                color: token.colorPrimary,
              }}
            />
          }
          onClick={() => webuiNavigate('/session/start')}
        />
      ),
    },
    startBatchSession: {
      content: (
        <ActionItemContent
          title={t('start.StartBatchSession')}
          description={t('start.StartBatchSessionDesc')}
          buttonText={t('start.button.StartSession')}
          icon={
            <AppstoreAddOutlined
              style={{
                fontSize: token.fontSizeHeading3,
                color: token.colorPrimary,
              }}
            />
          }
          onClick={() => {
            const launcherValue: DeepPartial<SessionLauncherFormValue> = {
              sessionType: 'batch',
            };
            const params = new URLSearchParams();
            params.set('step', '0');
            params.set('formValues', JSON.stringify(launcherValue));
            webuiNavigate(`/session/start?${params.toString()}`, {
              state: {
                from: {
                  pathname: '/start',
                  label: t('start.StartSession'),
                },
              } as SessionLauncherPageLocationState,
            });
          }}
        />
      ),
    },
    modelService: {
      content: (
        <ActionItemContent
          itemRole="admin"
          title={t('start.ModelService')}
          description={t('start.ModelServiceDesc')}
          buttonText={t('start.button.ModelService')}
          icon={
            <AppstoreAddOutlined
              style={{
                fontSize: token.fontSizeHeading3,
                color: token.colorInfo,
              }}
            />
          }
          onClick={() => webuiNavigate('/service/start')}
        />
      ),
    },
    startFromExample: {
      content: (
        <ActionItemContent
          itemRole="admin"
          title={t('start.StartFromExample')}
          description={t('start.StartFromExampleDesc')}
          buttonText={t('start.button.StartNow')}
          icon={
            <PlaySquareOutlined
              style={{
                fontSize: token.fontSizeHeading3,
                color: token.colorInfo,
              }}
            />
          }
          onClick={() => webuiNavigate('/import')}
        />
      ),
    },
    startFromURL: {
      content: (
        <ActionItemContent
          itemRole="admin"
          title={t('start.StartFromURL')}
          description={t('start.StartFromURLDesc')}
          buttonText={t('start.button.StartNow')}
          icon={
            <LinkOutlined
              style={{
                fontSize: token.fontSizeHeading3,
                color: token.colorInfo,
              }}
            />
          }
          onClick={() => webuiNavigate('/import')}
        />
      ),
    },
  };
  const [summaryItemsSetting, setSummaryItemsSetting] =
    useBAISettingUserState('summary_items');

  const [items, setItems] = useState<Array<StartItem>>(
    !_.isEmpty(summaryItemsSetting)
      ? _.map(summaryItemsSetting, (item) => ({
          ...item,
          data: {
            ...defaultSummaryElements[item?.id],
          },
        }))
      : [
          {
            id: 'createFolder',
            rowSpan: 3,
            columnSpan: 1,
            columnOffset: { 4: 0 },
            data: defaultSummaryElements.createFolder,
          },
          {
            id: 'startSession',
            rowSpan: 3,
            columnSpan: 1,
            columnOffset: { 4: 1 },
            data: defaultSummaryElements.startSession,
          },
          {
            id: 'startBatchSession',
            rowSpan: 3,
            columnSpan: 1,
            columnOffset: { 4: 2 },
            data: defaultSummaryElements.startBatchSession,
          },
          {
            id: 'modelService',
            rowSpan: 3,
            columnSpan: 1,
            columnOffset: { 4: 0 },
            data: defaultSummaryElements.modelService,
          },
          {
            id: 'startFromExample',
            rowSpan: 3,
            columnSpan: 1,
            columnOffset: { 4: 1 },
            data: defaultSummaryElements.startFromExample,
          },
          {
            id: 'startFromURL',
            rowSpan: 3,
            columnSpan: 1,
            columnOffset: { 4: 2 },
            data: defaultSummaryElements.startFromURL,
          },
        ],
  );

  return (
    <BAIBoard
      items={items}
      onItemsChange={(event) => {
        const changedItems = event.detail.items as typeof items;
        setItems(changedItems);
        setSummaryItemsSetting(
          _.map(changedItems, (item) => _.omit(item, 'data')),
        );
      }}
    />
  );
};
export default StartPage;
