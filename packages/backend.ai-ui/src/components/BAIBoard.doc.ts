import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBoard',
  displayName: 'BAI Board',
  category: 'Layout',
  keywords: [
    'board',
    'dashboard',
    'grid',
    'drag',
    'resize',
    'panel',
    'widget',
    'layout',
  ],
  usage: {
    description:
      'The dashboard grid: ui-common `Board` behind the prop names the Backend.AI dashboards were written against. Each item carries its content in `data.content`, which the board renders as the item description; the first `BAIBoardItemTitle` inside that content renders in the item header row (ui-common `Board`), which the board pads and places with the drag handle on its first line. Content without one gets no header row. An item that sets its own `title` or `description` is passed to ui-common `Board` as is. The board pads every item (`itemPadding`), so content brings no inset of its own; `useIsInBAIBoardItem()` tells a component shared with non-board pages whether to pad itself. `movable`, `resizable` and `bordered` map onto the ui-common `isMovable`, `isResizable` and `variant` props, and `onItemsChange` receives `{ detail }` with the whole board in its new order, so the dashboards persist `event.detail.items` (minus `data`) and pass it back as `items`; the description node the adapter adds is stripped from what it reports. Items keep the shape the dashboards have always persisted (`id`, `rowSpan`, `columnSpan`, `columnOffset`, `definition`, `data`), so a layout stored in local storage keeps rendering. An item whose content renders a `BAIBoardItemErrorBoundary` fallback gets an error or warning border from the `data-bai-board-item-status` attribute.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Persist exactly what `event.detail.items` reports and rebuild `items` in that order on the next render; the board is controlled and snaps back otherwise.',
      },
      {
        guidance: true,
        description:
          'Start the content with one `BAIBoardItemTitle` and give it no inset; the board pads the title row and the body. Give the title of a second section in the same item `inline` so it stays in the body.',
      },
      {
        guidance: false,
        description:
          'Rendering two boards on one page for one set of panels; put every panel on the same board so order and layout persist as one list.',
      },
    ],
  },
  props: [
    {
      name: 'items',
      type: 'Array<BAIBoardItem<T>>',
      description:
        'The items: `id`, `data` (with `content`), optional `rowSpan`, `columnSpan`, `definition` (minimum and default spans) and `columnOffset` (a column per column count, written back by the board).',
      required: true,
    },
    {
      name: 'onItemsChange',
      type: '(event: { detail: BoardItemsChangeDetail<T> }) => void',
      description:
        "Called after a move or resize with `detail.items` (the whole board in its new order) and the `movedItem` or `resizedItem`. Removing an item is the consumer's: pass `items` without it.",
      required: true,
    },
    {
      name: 'movable',
      type: 'boolean',
      description: 'Renders a drag handle at the top-left of each item.',
      default: 'false',
    },
    {
      name: 'resizable',
      type: 'boolean',
      description: 'Renders a resize handle at the bottom-right of each item.',
      default: 'false',
    },
    {
      name: 'bordered',
      type: 'boolean',
      description: 'Draws a border on each item.',
      default: 'false',
    },
    {
      name: '...boardProps',
      type: 'BoardProps<T>',
      description:
        'Every other ui-common `Board` prop passes through: `itemPadding`, `emptyContent`, `columnBreakpoints`, `itemClassName`, the handle icons and labels, the live announcement builders, and div attributes for the root.',
    },
  ],
  examples: [
    {
      label: 'A persisted dashboard',
      code: `const [layout, setLayout] = useBAISettingUserState('dashboard_board_items');
const items = reconcileBoardLayout({ persistedLayout: layout ?? [], defaultLayout, renderableIds })
  .map((entry) => ({ ...entry, data: contentById.get(entry.id) }));

<BAIBoard
  movable
  resizable
  bordered
  items={items}
  onItemsChange={(event) => {
    setLayout(event.detail.items.map((item) => _.omit(item, 'data')));
  }}
/>`,
    },
    {
      label: 'A read-only board',
      code: `<BAIBoard
  items={[
    { id: 'a', rowSpan: 2, columnSpan: 2, data: { content: <PanelA /> } },
    { id: 'b', rowSpan: 2, columnSpan: 2, data: { content: <PanelB /> } },
  ]}
  onItemsChange={() => {}}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
