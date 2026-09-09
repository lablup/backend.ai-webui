import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIModelDeploymentNodes',
  displayName: 'BAI Model Deployment Nodes',
  category: 'Table & List',
  keywords: [
    'deployment',
    'model service',
    'inference',
    'endpoint',
    'replica',
    'table',
    'list',
  ],
  usage: {
    description:
      'The model-deployment list table shared by the user and admin deployment pages. It reads the plural Relay fragment `BAIModelDeploymentNodesFragment` on `ModelDeployment`, so the caller spreads that fragment on each deployment node in its own query and passes the array as `deploymentsFrgmt`; the fragment also pulls `BAIDeploymentTagChips_metadata` and `BAIDeploymentOwnerInfo_deployment`, so those child components are fed from the same record. Nineteen columns are built internally — name, revision number, lifecycle status, replica summary, model and created-at are visible by default, and the remaining thirteen (replicas, deployment id, tags, project, domain, resource group, current revision id, open-to-public, endpoint URL, preferred domain, strategy type, owner, updated-at) ship as `defaultHidden` so a surface opts into them through table settings. Rows are keyed by `id`, resizing is on and size is "small"; every BAITable prop except `dataSource`, `columns` and `onChangeOrder` passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Narrow the column set with `customizeColumns` when a page should not expose admin-only keys such as owner, project or domain.',
      },
      {
        guidance: true,
        description:
          'Bridge `onChangeOrder` to the server `DeploymentOrderField` enum with the shared `convertToOrderBy` helper, since the callback emits camelCase keys.',
      },
      {
        guidance: true,
        description:
          'Persist column visibility through `tableSettings`, because most columns start hidden and the component keeps no settings state.',
      },
      {
        guidance: false,
        description:
          'Expect an updated-at sort — the column is present but `updatedAt` is deliberately left out of the sortable keys, since the server order enum has no matching field.',
      },
      {
        guidance: false,
        description:
          'Rely on the project name always rendering; when `projectV2` is unavailable the cell falls back to the project id alone.',
      },
    ],
  },
  props: [
    {
      name: 'deploymentsFrgmt',
      type: 'BAIModelDeploymentNodesFragment$key',
      description:
        'Plural fragment reference on `ModelDeployment` — the rows, in the order given. Null and undefined entries are filtered out before rendering.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<ModelDeploymentNodeInList>) => BAIColumnsType<ModelDeploymentNodeInList>',
      description:
        'Transforms the base columns into the final column set — filter out admin-only keys, reorder, or splice in an action column. Left unset, the base columns are used as-is.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every base column, making the headers non-sortable — use it where sorting is not wired to the query.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableDeploymentSorterValues)[number] | null) => void',
      description:
        'Called with the active sort key ("name", "createdAt", "domain", "project", "resourceGroup", "tag", or their "-" prefixed descending form), or null when sorting is cleared. The created-at column starts sorted descending.',
    },
  ],
  examples: [
    {
      label: 'Deployment list page with a reduced column set',
      code: `<BAIModelDeploymentNodes
  deploymentsFrgmt={deploymentNodes}
  loading={isPending}
  order={queryParams.order}
  onChangeOrder={(order) => {
    setQueryParams({ order: (order as DeploymentOrderValue) ?? null });
  }}
  tableSettings={{
    columnOverrides,
    onColumnOverridesChange: setColumnOverrides,
  }}
  customizeColumns={(base) =>
    base.filter((column) => allowedKeys.includes(column.key as string))
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
