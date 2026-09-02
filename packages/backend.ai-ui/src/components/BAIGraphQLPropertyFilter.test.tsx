/**
 to-astryx TICKET 28 — `BAIGraphQLPropertyFilter` is now an Astryx
 `PowerSearch`, so the antd-era DOM tests (tag close buttons, commit-on-select)
 no longer describe anything real. What still has to hold is the GraphQL filter
 OBJECT contract — that object is both the Relay variable and the page's URL
 state — so these tests target the serializer / reverse-parser pair directly:

     URL / Relay filter object  ->  PowerSearch tokens  ->  the same object

 The `describe('URL filter round-trip …')` block walks a representative filter
 object for every page that mounts this component (the ticket-28 consumer
 census) and asserts structural equality.
*/
import BAIGraphQLPropertyFilter, {
  buildNestedFilter,
  graphQLFilterToPowerSearchFilters,
  powerSearchFiltersToGraphQLFilter,
  type FilterProperty,
  type GraphQLFilter,
} from './BAIGraphQLPropertyFilter';
import { render, screen } from '@testing-library/react';

describe('buildNestedFilter', () => {
  it('builds a single-level filter', () => {
    expect(buildNestedFilter('name', { eq: 'test' })).toEqual({
      name: { eq: 'test' },
    });
  });

  it('builds a nested filter from a dot-notation path', () => {
    expect(buildNestedFilter('project.name', { eq: 'test' })).toEqual({
      project: { name: { eq: 'test' } },
    });
  });

  it.each(['__proto__', 'constructor', 'prototype'])(
    'rejects prototype-polluting key "%s" (returns empty filter)',
    (key) => {
      expect(buildNestedFilter(`${key}.polluted`, { eq: 'x' })).toEqual({});
      // Object.prototype must remain untouched.
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    },
  );

  it.each(['a..b', '.a', 'a.', '.', ''])(
    'rejects empty path segment in "%s" (returns empty filter)',
    (path) => {
      expect(buildNestedFilter(path, { eq: 'x' })).toEqual({});
    },
  );
});

/** The full object -> tokens -> object cycle a shared link goes through. */
const roundTrip = (
  filterProperties: Array<FilterProperty>,
  value: GraphQLFilter | undefined,
  combinationMode: 'AND' | 'OR' = 'AND',
) =>
  powerSearchFiltersToGraphQLFilter(
    graphQLFilterToPowerSearchFilters(value, filterProperties),
    filterProperties,
    combinationMode,
  );

// One property set per page that mounts `BAIGraphQLPropertyFilter`,
// transcribed from the call site, paired with a filter object that page can
// produce.
const PAGE_FIXTURES: Array<{
  page: string;
  filterProperties: Array<FilterProperty>;
  filters: Array<GraphQLFilter>;
}> = [
  {
    page: 'ScopedAuditLog',
    filterProperties: [
      {
        key: 'entityId',
        propertyLabel: 'Entity ID',
        type: 'string',
        fixedOperator: 'contains',
      },
      {
        key: 'createdAt',
        propertyLabel: 'Created at',
        type: 'datetime',
        defaultOperator: 'after',
      },
    ],
    filters: [
      { entityId: { contains: 'session-1' } },
      { createdAt: { after: '2026-01-02T03:04:05.000Z' } },
      {
        AND: [
          { entityId: { contains: 'vfolder' } },
          { createdAt: { before: '2026-02-01T00:00:00.000Z' } },
        ],
      },
    ],
  },
  {
    page: 'AdminUserManagement / ProjectAdminUsersPage',
    filterProperties: [
      {
        key: 'email',
        propertyLabel: 'Email',
        type: 'string',
        fixedOperator: 'contains',
      },
      { key: 'isActive', propertyLabel: 'Active', type: 'boolean' },
      {
        key: 'role',
        propertyLabel: 'Role',
        type: 'enum',
        strictSelection: true,
        options: [
          { label: 'ADMIN', value: 'ADMIN' },
          { label: 'USER', value: 'USER' },
        ],
      },
    ],
    filters: [
      { email: { contains: 'lablup' } },
      { isActive: true },
      { role: { equals: 'ADMIN' } },
      { role: { in: ['ADMIN', 'USER'] } },
      { AND: [{ email: { contains: 'a' } }, { isActive: false }] },
    ],
  },
  {
    page: 'DeploymentListPage / ProjectAdminDeploymentsPage / AdminDeployment',
    filterProperties: [
      {
        key: 'metadata.name',
        propertyLabel: 'Name',
        type: 'string',
        fixedOperator: 'contains',
      },
      { key: 'isPublic', propertyLabel: 'Public', type: 'boolean' },
      {
        key: 'createdAt',
        propertyLabel: 'Created at',
        type: 'datetime',
        defaultOperator: 'after',
      },
    ],
    filters: [
      { metadata: { name: { contains: 'llm' } } },
      { isPublic: true },
      {
        AND: [
          { metadata: { name: { contains: 'chat' } } },
          { createdAt: { after: '2026-03-04T05:06:07.000Z' } },
        ],
      },
    ],
  },
  {
    page: 'RBACManagementPage / RoleAssignmentTab / ScopedRolePermissionCard',
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Role name',
        type: 'string',
        fixedOperator: 'contains',
      },
      {
        key: 'userId',
        propertyLabel: 'User',
        type: 'uuid',
        fixedOperator: 'equals',
        renderInput: () => null,
      },
    ],
    filters: [
      { name: { contains: 'admin' } },
      { userId: { equals: '11111111-2222-3333-4444-555555555555' } },
      {
        AND: [
          { name: { contains: 'ops' } },
          { userId: { equals: '99999999-8888-7777-6666-555555555555' } },
        ],
      },
    ],
  },
  {
    page: 'UserResourcePolicyV2 / MyKeypairManagementModal',
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        fixedOperator: 'contains',
      },
      { key: 'maxVfolderCount', propertyLabel: 'Max folders', type: 'number' },
    ],
    filters: [
      { name: { contains: 'default' } },
      { maxVfolderCount: { greaterThanOrEqual: 10 } },
      {
        AND: [
          { name: { contains: 'gpu' } },
          { maxVfolderCount: { lessThan: 100 } },
        ],
      },
    ],
  },
  {
    page: 'KeypairResourcePolicyV2',
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        fixedOperator: 'contains',
      },
      {
        key: 'createdAt',
        propertyLabel: 'Created at',
        type: 'datetime',
        defaultOperator: 'after',
      },
      {
        key: 'maxConcurrentSessions',
        propertyLabel: 'Concurrent sessions',
        type: 'number',
      },
    ],
    filters: [
      { name: { contains: 'default' } },
      { createdAt: { after: '2026-01-02T03:04:05.000Z' } },
      { maxConcurrentSessions: { greaterThanOrEqual: 5 } },
      {
        AND: [
          { name: { contains: 'gpu' } },
          { maxConcurrentSessions: { lessThan: 10 } },
        ],
      },
    ],
  },
  {
    page: 'ProjectResourcePolicyV2',
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        fixedOperator: 'contains',
      },
      { key: 'maxVfolderCount', propertyLabel: 'Max folders', type: 'number' },
      { key: 'maxNetworkCount', propertyLabel: 'Max networks', type: 'number' },
    ],
    filters: [
      { name: { contains: 'default' } },
      { maxVfolderCount: { greaterThanOrEqual: 10 } },
      { maxNetworkCount: { greaterThanOrEqual: 1 } },
      {
        AND: [
          { name: { contains: 'gpu' } },
          { maxVfolderCount: { lessThan: 100 } },
        ],
      },
    ],
  },
  {
    page: 'ReservoirPage / ModelStoreListPageV2',
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        fixedOperator: 'contains',
      },
      {
        key: 'type',
        propertyLabel: 'Type',
        type: 'enum',
        strictSelection: true,
        options: [
          { label: 'MODEL', value: 'MODEL' },
          { label: 'PACKAGE', value: 'PACKAGE' },
        ],
      },
    ],
    filters: [
      { name: { contains: 'llama' } },
      { type: { equals: 'MODEL' } },
      { type: { notIn: ['PACKAGE'] } },
    ],
  },
  {
    page: 'LegacyRolePermissionTab (scalar valueMode)',
    filterProperties: [
      {
        key: 'entityType',
        propertyLabel: 'Entity type',
        type: 'string',
        valueMode: 'scalar',
      },
      {
        key: 'operation',
        propertyLabel: 'Operation',
        type: 'string',
        valueMode: 'scalar',
      },
    ],
    filters: [
      { entityType: 'vfolder' },
      { AND: [{ entityType: 'session' }, { operation: 'read' }] },
    ],
  },
];

describe('URL filter round-trip (no shared-link regression)', () => {
  it.each(
    PAGE_FIXTURES.flatMap(({ page, filterProperties, filters }) =>
      filters.map((filter) => ({
        page,
        filterProperties,
        filter,
        name: JSON.stringify(filter),
      })),
    ),
  )('$page — $name', ({ filterProperties, filter }) => {
    expect(roundTrip(filterProperties, filter)).toEqual(filter);
  });

  it('re-parses what it emitted (tokens are stable across a second cycle)', () => {
    const { filterProperties } = PAGE_FIXTURES[1];
    const first: GraphQLFilter = {
      AND: [{ email: { contains: 'a' } }, { role: { equals: 'ADMIN' } }],
    };
    expect(
      roundTrip(filterProperties, roundTrip(filterProperties, first)),
    ).toEqual(first);
  });

  it('keeps an empty filter empty', () => {
    expect(roundTrip(PAGE_FIXTURES[0].filterProperties, undefined)).toBe(
      undefined,
    );
    expect(roundTrip(PAGE_FIXTURES[0].filterProperties, {})).toBe(undefined);
  });

  it('preserves the OR combination mode', () => {
    const { filterProperties } = PAGE_FIXTURES[1];
    const filter: GraphQLFilter = {
      OR: [{ email: { contains: 'a' } }, { email: { contains: 'b' } }],
    };
    expect(roundTrip(filterProperties, filter, 'OR')).toEqual(filter);
  });
});

describe('token <-> condition value mapping', () => {
  const { filterProperties } = PAGE_FIXTURES[1];

  it('maps a boolean scalar property to an enum token', () => {
    const [token] = graphQLFilterToPowerSearchFilters(
      { isActive: true },
      filterProperties,
    );
    expect(token).toEqual({
      field: 'isActive',
      operator: 'equals',
      value: { type: 'enum', value: 'true' },
    });
  });

  it('maps an `in` list to an enum_list token', () => {
    const [token] = graphQLFilterToPowerSearchFilters(
      { role: { in: ['ADMIN', 'USER'] } },
      filterProperties,
    );
    expect(token.value).toEqual({
      type: 'enum_list',
      value: ['ADMIN', 'USER'],
    });
  });

  it('maps a datetime to an absolute-date token (second precision)', () => {
    const [token] = graphQLFilterToPowerSearchFilters(
      { createdAt: { after: '2026-01-02T03:04:05.000Z' } },
      PAGE_FIXTURES[0].filterProperties,
    );
    expect(token.value).toEqual({
      type: 'date_absolute',
      unixSeconds: Math.floor(Date.parse('2026-01-02T03:04:05.000Z') / 1000),
    });
  });

  it('keeps at most one condition per property when `singleCondition` is set', () => {
    const filters = graphQLFilterToPowerSearchFilters(
      { AND: [{ email: { contains: 'a' } }, { email: { contains: 'b' } }] },
      filterProperties,
    );
    expect(
      powerSearchFiltersToGraphQLFilter(filters, filterProperties, 'AND', true),
    ).toEqual({ email: { contains: 'b' } });
  });
});

describe('BAIGraphQLPropertyFilter render', () => {
  it('renders the PowerSearch input', () => {
    render(
      <BAIGraphQLPropertyFilter
        data-testid="graphql-property-filter"
        filterProperties={PAGE_FIXTURES[1].filterProperties}
        value={{ email: { contains: 'lablup' } }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('graphql-property-filter')).toBeInTheDocument();
  });
});
