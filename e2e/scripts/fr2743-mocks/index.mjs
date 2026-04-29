// Aggregator for FR-2743 mock items.
import simpleModals from './simple-modals.mjs';
import tablesAndPanels from './tables-and-panels.mjs';
import formsAndPanels from './forms-and-panels.mjs';
import chatPanels from './chat-panels.mjs';
import quotaPages from './quota-pages.mjs';
import launchDialogs from './launch-dialogs.mjs';
import misc from './misc.mjs';

export const items = [
  ...simpleModals,
  ...tablesAndPanels,
  ...formsAndPanels,
  ...chatPanels,
  ...quotaPages,
  ...launchDialogs,
  ...misc,
];
