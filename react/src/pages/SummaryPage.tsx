import BAICustomizableGrid from '../components/BAIBoard';
import SummaryItemDownloadApp from '../components/SummaryPageItems/SummaryItemDownloadApp';
import SummaryItemInvitation from '../components/SummaryPageItems/SummaryItemInvitation';
import SummaryItemStartMenu from '../components/SummaryPageItems/SummaryItemStartMenu';
import { BoardProps } from '@cloudscape-design/board-components/board';
import { DataFallbackType } from '@cloudscape-design/board-components/internal/interfaces';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SummaryPage: React.FC = () => {
  const { t } = useTranslation();
  const [boardItems, setBoardItems] = useState<
    BoardProps.Item<DataFallbackType>[]
  >([
    {
      id: '1',
      rowSpan: 5,
      columnSpan: 1,
      data: {
        title: t('summary.StartMenu'),
        content: <SummaryItemStartMenu allowNeoSessionLauncher />,
      },
    },
    {
      id: '2',
      rowSpan: 1,
      columnSpan: 1,
      data: {
        title: t('summary.Invitation'),
        content: <SummaryItemInvitation />,
      },
    },
    {
      id: '3',
      rowSpan: 1,
      columnSpan: 1,
      data: {
        title: t('summary.DownloadWebUIApp'),
        content: <SummaryItemDownloadApp />,
      },
    },
  ]);

  return (
    <BAICustomizableGrid
      parsedItems={boardItems}
      onItemsChange={(event) =>
        setBoardItems(event.detail.items as BoardProps.Item<DataFallbackType>[])
      }
    />
  );
};

export default SummaryPage;
