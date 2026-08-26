import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRouteNodes',
  displayName: 'BAI Route Nodes',
  category: 'Table & List',
  keywords: [
    'route',
    'routing',
    'endpoint',
    'replica',
    'inference',
    'table',
    'health',
  ],
  usage: {
    description:
      'The route (replica) table of a model service endpoint. It reads the plural Relay fragment `BAIRouteNodesFragment` on `Route`, so the caller spreads that fragment on each route node in its own query and passes the array as `routesFrgmt`; null and undefined entries are dropped and rows are keyed by `id`. Columns are route id (with a red alert button when the row carries `errorData`), session id, status tag, health-status tag, and created-at; the health-status column is rendered only when the connected client reports the `route-health-status` capability, so the component must sit under BAIClientProvider. The three `onClick*` props are what make the id, error and scheduling-history affordances appear at all — without them the cells render as plain text. It renders BAITable, so every BAITable prop except `dataSource`, `columns` and `onChangeOrder` passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass `onClickSessionId` when the surface can route to a session detail view; the cell falls back to plain text otherwise.',
      },
      {
        guidance: true,
        description:
          'Pass `onClickErrorData` so failed routes can be inspected — the alert button is only rendered for rows whose `errorData` is non-empty, so it stays invisible on healthy tables.',
      },
      {
        guidance: true,
        description:
          'Render it inside a BAIClientProvider tree, since the health-status column is gated on a client capability lookup.',
      },
      {
        guidance: false,
        description:
          'Count on a traffic-ratio or traffic-status column — both are commented out pending backend support, so `trafficRatio` is selected but never displayed.',
      },
      {
        guidance: false,
        description:
          'Assume `onClickSchedulingHistory` receives the relay global id; it is handed the decoded UUID, falling back to the raw id when decoding fails.',
      },
    ],
  },
  props: [
    {
      name: 'routesFrgmt',
      type: 'BAIRouteNodesFragment$key',
      description:
        'Plural fragment reference on `Route` — the rows, in the order given. Null and undefined entries are filtered out before rendering.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<RouteNodeInList>) => BAIColumnsType<RouteNodeInList>',
      description:
        'Transforms the base columns into the final column set — reorder, drop, or splice in a column. Left unset, the base columns are used as-is.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every base column. Affects the status and created-at columns, the only two that carry a sorter.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableRouteSorterValues)[number] | null) => void',
      description:
        'Called with the active sort key ("status", "createdAt", "trafficRatio", or their "-" prefixed descending form), or null when sorting is cleared.',
    },
    {
      name: 'onClickSessionId',
      type: '(sessionId: string) => void',
      description:
        'Turns the session cell into a link and receives the local (decoded) session id. Without it the session id renders as plain text.',
    },
    {
      name: 'onClickErrorData',
      type: '(errorData: unknown) => void',
      description:
        'Receives the raw `errorData` payload when the alert button next to the route id is clicked. The button appears only on rows whose `errorData` is non-empty.',
    },
    {
      name: 'onClickSchedulingHistory',
      type: '(routeId: string) => void',
      description:
        'Adds a history icon button beside the status tag and receives the route’s decoded UUID. Omitting it removes the button entirely.',
    },
  ],
  examples: [
    {
      label: 'Routes of an endpoint with drill-downs',
      code: `<BAIRouteNodes
  loading={isPendingRefetch}
  routesFrgmt={filterOutNullAndUndefined(
    _.map(data.endpoint?.routings?.edges, 'node'),
  )}
  onClickSessionId={(sessionId) => {
    navigate(\`/session/\${sessionId}\`);
  }}
  onClickErrorData={setInspectingErrorData}
  onClickSchedulingHistory={setSchedulingHistoryRouteId}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
