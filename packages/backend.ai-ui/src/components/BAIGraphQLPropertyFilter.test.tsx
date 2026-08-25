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
  conditionToTokenValue,
  graphQLFilterToPowerSearchFilters,
  powerSearchFiltersToGraphQLFilter,
  tokenValueToConditionValue,
  type FilterEntitySource,
  type FilterProperty,
  type GraphQLFilter,
} from './BAIGraphQLPropertyFilter';
import {
  BAIPowerSearchEntityEditor,
  useEntityLabelCache,
  useRenderInputEditors,
  type EntityLabelCache,
} from './BAIPowerSearchAdapters';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const USER_UUID = '11111111-2222-3333-4444-555555555555';
/** Matches the token text even after PowerSearch truncates it. */
const TRUNCATED_UUID = /^11111111-2222-3333-4444-5555/;

/** An `entitySource` with no `resolve`: tokens keep the raw id. */
const idOnlyUserSource: FilterEntitySource = { search: async () => [] };

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
        // The page supplies a Relay-backed picker here; serialization is
        // unaffected by the editor, so the fixture only needs the shape.
        entitySource: idOnlyUserSource,
        fixedOperator: 'equals',
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

  it('keeps an entitySource id byte-identical (no URL migration)', () => {
    // The RBAC shape, with the nested key the page actually declares. An
    // `entitySource` property must serialize exactly what `renderInput` did.
    const filterProperties: Array<FilterProperty> = [
      {
        key: 'assignedUser.userId',
        propertyLabel: 'User',
        type: 'uuid',
        fixedOperator: 'equals',
        entitySource: idOnlyUserSource,
      },
    ];
    const filter: GraphQLFilter = {
      assignedUser: { userId: { equals: USER_UUID } },
    };
    const result = roundTrip(filterProperties, filter);
    expect(result).toEqual(filter);
    expect(JSON.stringify(result)).toBe(JSON.stringify(filter));
  });

  it('keeps a renderInput value byte-identical too (escape hatch kept)', () => {
    const filterProperties: Array<FilterProperty> = [
      {
        key: 'assignedUser.userId',
        propertyLabel: 'User',
        type: 'uuid',
        fixedOperator: 'equals',
        renderInput: () => null,
      },
    ];
    const filter: GraphQLFilter = {
      assignedUser: { userId: { equals: USER_UUID } },
    };
    expect(JSON.stringify(roundTrip(filterProperties, filter))).toBe(
      JSON.stringify(filter),
    );
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

/** An entity property; single-valued (`equals`) unless `overrides` says else. */
const entityProperty = (
  entitySource: FilterEntitySource,
  overrides: Partial<FilterProperty> = {},
): FilterProperty =>
  ({
    key: 'assignedUser.userId',
    propertyLabel: 'User',
    type: 'uuid',
    fixedOperator: 'equals',
    entitySource,
    ...overrides,
  }) as FilterProperty;

describe('entitySource token mapping', () => {
  const property = entityProperty(idOnlyUserSource, {
    fixedOperator: undefined,
    operators: ['equals', 'in'],
  });
  const condition = (operator: 'equals' | 'in', value: unknown) => ({
    id: 'c1',
    property: 'assignedUser.userId',
    operator,
    value,
    propertyLabel: 'User',
    type: 'uuid' as const,
  });

  it('maps an `equals` condition to the raw id', () => {
    expect(
      conditionToTokenValue(condition('equals', USER_UUID), property),
    ).toEqual({ type: 'custom', value: USER_UUID });
  });

  it('maps an `in` condition to a JSON id array', () => {
    expect(
      conditionToTokenValue(condition('in', ['a', 'b']), property),
    ).toEqual({ type: 'custom', value: '["a","b"]' });
  });

  it('reverses a single-id token back to the raw id', () => {
    expect(
      tokenValueToConditionValue(
        { type: 'custom', value: USER_UUID },
        property,
        'equals',
      ),
    ).toBe(USER_UUID);
  });

  it('reverses a JSON-array token back to an id array', () => {
    expect(
      tokenValueToConditionValue(
        { type: 'custom', value: '["a","b"]' },
        property,
        'in',
      ),
    ).toEqual(['a', 'b']);
  });

  it('keeps a single id that looks like JSON a string', () => {
    expect(
      tokenValueToConditionValue(
        { type: 'custom', value: '[bracketed-id' },
        property,
        'equals',
      ),
    ).toBe('[bracketed-id');
  });

  it.each([
    { arity: 'single', input: condition('equals', USER_UUID) },
    { arity: 'multi', input: condition('in', ['a', 'b']) },
    { arity: 'single', input: condition('equals', '[bracketed-id') },
  ])('is an exact inverse for the $arity arity', ({ input }) => {
    expect(
      tokenValueToConditionValue(
        conditionToTokenValue(input, property),
        property,
        input.operator,
      ),
    ).toEqual(input.value);
  });
});

describe('renderInput takes precedence over entitySource', () => {
  const both = {
    key: 'ownerId',
    propertyLabel: 'Owner',
    type: 'string',
    operators: ['in'],
    renderInput: () => null,
    entitySource: idOnlyUserSource,
  } satisfies FilterProperty;
  const entityOnly = {
    ...both,
    renderInput: undefined,
  } satisfies FilterProperty;
  // The reverse parser joins a list value, so this is the shape the pipeline
  // actually hands `conditionToTokenValue`.
  const condition = {
    id: 'c1',
    property: 'ownerId',
    operator: 'in' as const,
    value: 'a, b',
    propertyLabel: 'Owner',
    type: 'string' as const,
  };

  it('emits the renderInput token shape, not the entity JSON array', () => {
    expect(conditionToTokenValue(condition, both)).toEqual({
      type: 'custom',
      value: 'a, b',
    });
    expect(conditionToTokenValue(condition, entityOnly)).toEqual({
      type: 'custom',
      value: '["a","b"]',
    });
  });

  // The two custom editors format their token differently: the entity one maps
  // each id through the label cache, `renderInput`'s looks the whole staged
  // value up and misses. So the token text says which editor the config got.
  const labelledSource: FilterEntitySource = {
    search: async () => [],
    resolve: async (ids) =>
      ids.map((id) => ({ id, label: `${id}@lablup.com` })),
  };
  const value: GraphQLFilter = { ownerId: { in: ['a', 'b'] } };

  it('renders resolved labels when only entitySource is declared', async () => {
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={[{ ...entityOnly, entitySource: labelledSource }]}
        value={value}
        onChange={() => {}}
      />,
    );
    expect(
      await screen.findByText('a@lablup.com, b@lablup.com'),
    ).toBeInTheDocument();
  });

  it('keeps the raw staged value and asks nothing when both are declared', async () => {
    const resolve = vi.fn(labelledSource.resolve);
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={[
          { ...both, entitySource: { ...labelledSource, resolve } },
        ]}
        value={value}
        onChange={() => {}}
      />,
    );
    await act(async () => {
      await new Promise((done) => setTimeout(done, 0));
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(screen.getByText('a, b')).toBeInTheDocument();
    expect(screen.queryByText(/@lablup\.com/)).not.toBeInTheDocument();
  });
});

describe('content-search field auto-pick', () => {
  it('skips entitySource properties', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={[
          {
            key: 'ownerId',
            propertyLabel: 'Owner',
            type: 'string',
            entitySource: idOnlyUserSource,
          },
          { key: 'name', propertyLabel: 'Name', type: 'string' },
        ]}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByRole('combobox'), 'hello{Enter}');
    expect(onChange).toHaveBeenCalledWith({ name: { iContains: 'hello' } });
  });
});

describe('entity label resolution', () => {
  const filter: GraphQLFilter = {
    assignedUser: { userId: { equals: USER_UUID } },
  };

  it('swaps the raw id for the label the source resolves', async () => {
    const resolve = vi.fn(async () => [
      { id: USER_UUID, label: 'alice@lablup.com' },
    ]);
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={[entityProperty({ search: async () => [], resolve })]}
        value={filter}
        onChange={() => {}}
      />,
    );
    expect(await screen.findByText('alice@lablup.com')).toBeInTheDocument();
    expect(resolve).toHaveBeenCalledWith([USER_UUID]);
  });

  it('keeps the raw id, asks once, and swallows a rejecting resolve', async () => {
    const unhandled: Array<unknown> = [];
    const trackUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', trackUnhandled);
    try {
      const resolve = vi.fn(() => Promise.reject(new Error('resolve failed')));
      render(
        <BAIGraphQLPropertyFilter
          filterProperties={[
            entityProperty({ search: async () => [], resolve }),
          ]}
          value={filter}
          onChange={() => {}}
        />,
      );
      await waitFor(() => expect(resolve).toHaveBeenCalledTimes(1));
      // One macrotask: long enough for Node to report an unhandled rejection.
      await new Promise((done) => setTimeout(done, 0));
      expect(screen.getByText(TRUNCATED_UUID)).toBeInTheDocument();
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', trackUnhandled);
    }
  });

  it('keeps two properties sharing one id on their own labels', async () => {
    const sourceFor = (label: string): FilterEntitySource => ({
      search: async () => [],
      resolve: async (ids) => ids.map((id) => ({ id, label })),
    });
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={[
          entityProperty(sourceFor('assignee@lablup.com')),
          entityProperty(sourceFor('creator@lablup.com'), {
            key: 'createdBy.userId',
            propertyLabel: 'Creator',
          }),
        ]}
        value={{
          AND: [filter, { createdBy: { userId: { equals: USER_UUID } } }],
        }}
        onChange={() => {}}
      />,
    );
    expect(await screen.findByText('assignee@lablup.com')).toBeInTheDocument();
    expect(screen.getByText('creator@lablup.com')).toBeInTheDocument();
  });

  it('falls back to the raw id when the source has no resolve', () => {
    render(
      <BAIGraphQLPropertyFilter
        filterProperties={[entityProperty(idOnlyUserSource)]}
        value={filter}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(TRUNCATED_UUID)).toBeInTheDocument();
  });
});

describe('BAIPowerSearchEntityEditor', () => {
  const labels: EntityLabelCache = {
    record: () => {},
    recordMany: () => {},
    resolveLabel: (_property, id) =>
      id === USER_UUID ? 'alice@lablup.com' : id,
    ensureResolved: () => {},
  };

  const renderEditor = (isDisabled?: boolean) =>
    render(
      <BAIPowerSearchEntityEditor
        propertyKey="assignedUser.userId"
        source={idOnlyUserSource}
        labels={labels}
        isMulti={false}
        value={USER_UUID}
        onChange={() => {}}
        isDisabled={isDisabled}
      />,
    );

  it('shows the cached label for the staged id', () => {
    renderEditor();
    expect(screen.getByText('alice@lablup.com')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeEnabled();
  });

  it('disables the control when `isDisabled` is set', () => {
    renderEditor(true);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

describe('useRenderInputEditors', () => {
  it('hands `value` and `isDisabled` to the render prop', () => {
    const received: Array<{ value: string | null; isDisabled?: boolean }> = [];
    const Harness = () => {
      const editors = useRenderInputEditors({
        recordLabel: () => {},
        resolveLabel: (_property, value) => value,
      });
      const operatorValue = editors.operatorValueFor('ownerId', (props) => {
        received.push({ value: props.value, isDisabled: props.isDisabled });
        return <span data-testid="render-input">{props.value}</span>;
      });
      if (!operatorValue) return null;
      const Editor = operatorValue.Editor;
      return <Editor value="x" isDisabled onChange={() => {}} placeholder="" />;
    };
    render(<Harness />);
    expect(received.at(-1)).toEqual({ value: 'x', isDisabled: true });
    expect(screen.getByTestId('render-input')).toHaveTextContent('x');
  });

  // `getString` is cached on the FIRST call, so it must not freeze the label
  // cache it was handed on that render.
  it('reads a label recorded after the operator value was cached', async () => {
    const Harness = () => {
      const labels = useEntityLabelCache();
      const editors = useRenderInputEditors({
        recordLabel: labels.record,
        resolveLabel: labels.resolveLabel,
      });
      const operatorValue = editors.operatorValueFor('ownerId', () => null);
      return (
        <>
          <button
            onClick={() =>
              labels.record('ownerId', USER_UUID, 'alice@lablup.com')
            }
          >
            record
          </button>
          <span data-testid="token">
            {operatorValue?.getString(USER_UUID) ?? ''}
          </span>
        </>
      );
    };
    render(<Harness />);
    expect(screen.getByTestId('token')).toHaveTextContent(USER_UUID);
    await userEvent.setup().click(screen.getByRole('button'));
    expect(screen.getByTestId('token')).toHaveTextContent('alice@lablup.com');
  });
});
