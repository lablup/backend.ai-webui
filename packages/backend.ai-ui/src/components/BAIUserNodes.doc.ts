import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIUserNodes',
  displayName: 'BAI User Nodes',
  category: 'Table & List',
  keywords: [
    'user table',
    'user list',
    'accounts',
    'relay fragment',
    'data grid',
    'admin',
    'members',
  ],
  usage: {
    description:
      'The shared user table. It reads a plural BAIUserNodesFragment reference and renders a resizable, small-size BAITable keyed on the node id, with the full column set the admin views agree on — email with copy, local id, username, full name, domain, projects, role, resource policy, allowed client IPs, container uid/gids, description, the sudo / password-change / two-factor flags as BooleanTags, status and status info, and created / modified timestamps formatted through dayjs. Column titles and the boolean labels come from useBAIi18n, and sorting is enabled only on the keys the backend can order by, so a column with no server-side sorter renders unsorted rather than lying. dataSource and columns are owned by the component and omitted from the props type; the rest of BAITableProps — rowSelection, pagination, order, tableSettings, exportSettings — passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread BAIUserNodesFragment on a plural user-node selection and hand the result in as-is; the component drops nulls itself.',
      },
      {
        guidance: true,
        description:
          'Insert, remove or reorder columns through customizeColumns rather than building a second table, so the shared columns keep their keys, export keys and translated titles.',
      },
      {
        guidance: true,
        description:
          'Feed onChangeOrder into the query order variable — it hands back a signed sorter key such as -created_at, already in the shape the server expects, and null when sorting is cleared.',
      },
      {
        guidance: false,
        description:
          'Adding a sorter to a customized column for a field outside availableUserSorterValues; the backend cannot order by it and the request fails at runtime.',
      },
      {
        guidance: false,
        description:
          'Setting disableSorter to hide one unsortable column — it strips the sorter from every column, so use customizeColumns for a single-column change.',
      },
    ],
  },
  props: [
    {
      name: 'usersFrgmt',
      type: 'BAIUserNodesFragment$key',
      description:
        'Relay fragment reference for the users to display. Plural, so pass the array of nodes rather than one node.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnType<UserNodeInList>[]) => BAIColumnType<UserNodeInList>[]',
      description:
        'Transforms the built-in column list before it reaches the table. Receives the base columns in order and returns the set to render, which is how a page adds an actions column or drops fields it has no permission to show.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Removes the sorter from every column, for embeddings where the surrounding query cannot re-order results.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: UserSorterValue | null) => void',
      description:
        'Fired when the user changes sorting. Receives a sorter key, prefixed with a minus for descending, or null when the sort is cleared.',
    },
  ],
  examples: [
    {
      label: 'Query orchestrator spreading the fragment',
      code: `const data = useLazyLoadQuery<UserListQuery>(
  graphql\`
    query UserListQuery {
      user_nodes(limit: $limit, offset: $offset) {
        edges {
          node {
            ...BAIUserNodesFragment
          }
        }
      }
    }
  \`,
  queryVariables,
);

<BAIUserNodes
  usersFrgmt={_.compact(_.map(data.user_nodes?.edges, 'node'))}
  order={order}
  onChangeOrder={(next) => setOrder(next)}
  pagination={{ current: 1, pageSize: 10, total: 42 }}
/>;`,
    },
    {
      label: 'With row selection and a customized column set',
      code: `<BAIUserNodes
  usersFrgmt={users}
  customizeColumns={(baseColumns) =>
    _.filter(baseColumns, (column) => column.key !== 'container_gids')
  }
  rowSelection={{
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
