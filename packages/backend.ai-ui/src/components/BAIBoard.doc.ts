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
      'The dashboard grid: ui-common `Board` behind the prop names the Backend.AI dashboards were written against. Each item carries its content in `data.content`, which the default `renderItem` draws; the board renders the surface, border and handles around it. `movable`, `resizable` and `bordered` map onto the ui-common `isMovable`, `isResizable` and `variant` props, and `onItemsChange` receives `{ detail }` with the whole board in its new order, so the dashboards persist `event.detail.items` (minus `data`) and pass it back as `items`. Items keep the shape the dashboards have always persisted (`id`, `rowSpan`, `columnSpan`, `columnOffset`, `definition`, `data`), so a layout stored in local storage keeps rendering. An item whose content renders a `BAIBoardItemErrorBoundary` fallback gets an error or warning border from the `data-bai-board-item-status` attribute.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Persist exactly what `event.detail.items` reports and rebuild `items` in that order on the next render; the board is controlled and snaps back otherwise.',
      },
      {
        guidance: true,
        description:
          'Give the content a horizontal inset (`--spacing-8`) and start it with `BAIBoardItemTitle`; the drag handle overlays the top-left corner of the item.',
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
        'Called after a move, resize or removal with `detail.items` (the whole board in its new order) and the `movedItem`, `resizedItem` or `removedItem`.',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(item: BAIBoardItem<T>, actions: { removeItem: () => void }) => React.ReactNode',
      description: 'The content of an item.',
      default: '(item) => item.data?.content',
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
        'Every other ui-common `Board` prop passes through: `emptyContent`, `columnBreakpoints`, `itemClassName`, the handle icons and labels, the live announcement builders, and div attributes for the root.',
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
