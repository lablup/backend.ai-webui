import BAIBoard from '../components/BAIBoard';
import SummaryItemDownloadApp from '../components/SummaryPageItems/SummaryItemDownloadApp';
import SummaryItemInvitation from '../components/SummaryPageItems/SummaryItemInvitation';
import SummaryItemShortCut from '../components/SummaryPageItems/SummaryItemShortCut';
import SummaryItemStartMenu from '../components/SummaryPageItems/SummaryItemStartMenu';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { BoardProps } from '@cloudscape-design/board-components/board';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SummaryItem
  extends BoardProps.Item<{
    title: string;
    content: JSX.Element;
  }> {
  id: 'startMenu' | 'invitation' | 'downloadApp' | 'shortCut';
}

const SummaryPage: React.FC = () => {
  const { t } = useTranslation();
  const defaultSummaryElements: {
    [key in SummaryItem['id']]: SummaryItem['data'];
  } = {
    startMenu: {
      title: t('summary.StartMenu'),
      content: <SummaryItemStartMenu allowNeoSessionLauncher />,
    },

    invitation: {
      title: t('summary.Invitation'),
      content: <SummaryItemInvitation />,
    },

    downloadApp: {
      title: t('summary.DownloadWebUIApp'),
      content: <SummaryItemDownloadApp />,
    },

    shortCut: {
      title: t('summary.shortCut'),
      content: <SummaryItemShortCut />,
    },
  };
  const [summaryItemsSetting, setSummaryItemsSetting] =
    useBAISettingUserState('summary_items');

  const [items, setItems] = useState<Array<SummaryItem>>(
    !_.isEmpty(summaryItemsSetting)
      ? _.map(summaryItemsSetting, (item) => ({
          ...item,
          data: {
            ...defaultSummaryElements[item?.id],
          },
        }))
      : [
          {
            id: 'startMenu',
            rowSpan: 5,
            columnSpan: 1,
            data: defaultSummaryElements.startMenu,
          },
          {
            id: 'invitation',
            rowSpan: 1,
            columnSpan: 1,
            data: defaultSummaryElements.invitation,
          },
          {
            id: 'downloadApp',
            rowSpan: 1,
            columnSpan: 1,
            data: defaultSummaryElements.downloadApp,
          },
          {
            id: 'shortCut',
            rowSpan: 1,
            columnSpan: 1,
            data: defaultSummaryElements.shortCut,
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
export default SummaryPage;
