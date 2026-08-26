import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBoardItemErrorBoundary',
  displayName: 'BAI Board Item Error Boundary',
  category: 'Feedback & Status',
  keywords: [
    'error boundary',
    'fallback',
    'dashboard panel',
    'board item',
    'crash',
    'recovery',
    'widget',
  ],
  hidden: true,
  usage: {
    description:
      'The error boundary that contains one dashboard board panel. While the children render, it adds nothing to the tree. When a child throws, it swaps the panel body for a BAIBoardItemTitle carrying the same title plus a BAIAlertIconWithTooltip explaining that something went wrong, so a failed panel keeps its slot and its heading on the board instead of collapsing the grid or taking the page down with it. It is a react-error-boundary ErrorBoundary underneath and exposes no reset affordance, so retrying means remounting it — the dashboard does that by keying it on the panel kind and descriptor.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Key it on everything that defines the panel, kind included, so editing a panel config clears a stuck fallback instead of leaving the previous failure on screen.',
      },
      {
        guidance: true,
        description:
          'Give it the same title the panel renders, so the board reads identically in the error state and the user can tell which widget failed.',
      },
      {
        guidance: true,
        description:
          'Place the Suspense boundary inside it rather than around it, so loading and failure both stay within the panel frame.',
      },
      {
        guidance: false,
        description:
          'Relying on it to recover from a failed fetch — it catches render errors only and offers the user no retry button.',
      },
      {
        guidance: false,
        description:
          'Wrapping a whole board or page in one instance; the point is that a single panel fails alone, which one boundary per panel is what buys.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'React.ReactNode | string',
      description:
        'Heading shown in the fallback, handed to BAIBoardItemTitle. Match the title the panel itself renders so the board stays readable when the panel is gone.',
    },
    {
      name: 'status',
      type: "'warning' | 'error'",
      description:
        'Severity of the fallback. Selects the alert icon tone and is written to the data-bai-board-item-status attribute on the fallback wrapper.',
      default: "'error'",
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style merged into the fallback wrapper, after its full height and token-based padding. Not applied while the children render successfully.',
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'The panel content to guard. Rendered untouched unless it throws during render.',
    },
  ],
  examples: [
    {
      label: 'A dashboard panel',
      code: `<BAIBoardItemErrorBoundary
  title={t('webui.menu.MyResources')}
  status="error"
>
  <Suspense fallback={<BAISkeleton style={{ padding: token.marginMD }} />}>
    <MyResource fetchKey={deferredFetchKey} refetching={isRefetching} />
  </Suspense>
</BAIBoardItemErrorBoundary>`,
    },
    {
      label: 'Keyed so a config edit clears a stuck fallback',
      code: `<BAIBoardItemErrorBoundary
  key={\`\${panel.panelType}:\${JSON.stringify(panel.descriptor)}\`}
  title={resolvePanelTitle(panel.descriptor, t)}
  status="error"
>
  <Panel descriptor={panel.descriptor} fetchKey={fetchKey} />
</BAIBoardItemErrorBoundary>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
