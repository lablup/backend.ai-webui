/**
 to-astryx TICKET 28 — `BAIPropertyFilter` is now an Astryx `PowerSearch`, so
 the antd-era DOM tests (property `Select` + `AutoComplete` + `Tag` close
 buttons) no longer describe anything real. What DOES still have to hold — and
 what a shared link depends on — is the filter-string contract, so these tests
 target the serializer / reverse-parser pair directly:

     URL / GraphQL filter string  ->  PowerSearch tokens  ->  the same string

 The `describe('URL filter round-trip …')` block below walks a representative
 filter string for every page that mounts this component (the ticket-28
 consumer census) and asserts byte-for-byte stability.
*/
import BAIPopconfirm from './BAIPopconfirm';
import BAIPropertyFilter, {
  buildFieldSpecs,
  defaultContentSearchFieldKey,
  mergeFilterValues,
  parseFilterString,
  parseFilterValue,
  serializeFilters,
  type FilterProperty,
} from './BAIPropertyFilter';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('parseFilterValue', () => {
  it('should correctly parse filter with binary operators', () => {
    const filter = 'created_at >= "2021-01-01"';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'created_at',
      operator: '>=',
      value: '2021-01-01',
    });
  });

  it('should correctly parse filter with equality operator', () => {
    const filter = 'status == "READY"';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'status',
      operator: '==',
      value: 'READY',
    });
  });

  it('should correctly parse filter with in operator', () => {
    const filter = 'permission in ["READ_ONLY", "READ_WRITE"]';
    const result = parseFilterValue(filter);
    expect(result).toEqual({
      property: 'permission',
      operator: 'in',
      value: '["READ_ONLY", "READ_WRITE"]',
    });
  });

  it('should correctly parse filter with ilike operator', () => {
    expect(parseFilterValue('creator ilike "%@example.com"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com',
    });
    expect(parseFilterValue('creator ilike "%@example.com%"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com%',
    });
  });

  it('should correctly parse filter with ilike operator and multiple spaces', () => {
    expect(parseFilterValue('creator  ilike  "%@example.com"')).toEqual({
      property: 'creator',
      operator: 'ilike',
      value: '%@example.com',
    });
  });

  it('preserves whitespace inside a double-quoted value', () => {
    expect(parseFilterValue('name ilike "%hello world%"')).toEqual({
      property: 'name',
      operator: 'ilike',
      value: '%hello world%',
    });
  });

  it('keeps inner whitespace of quoted list elements intact', () => {
    // Exercises the tokenizer edge case where list elements themselves contain
    // whitespace inside double quotes (must not be split on).
    expect(parseFilterValue('name in ["READ ONLY", "READ WRITE"]')).toEqual({
      property: 'name',
      operator: 'in',
      value: '["READ ONLY", "READ WRITE"]',
    });
  });

  it('treats Unicode whitespace (e.g. non-breaking space) as a separator', () => {
    // \u00A0 (a non-breaking space) is matched by \s but not by a fixed ASCII list.
    const NBSP = '\u00A0';
    expect(parseFilterValue(`name${NBSP}==${NBSP}"value"`)).toEqual({
      property: 'name',
      operator: '==',
      value: 'value',
    });
  });

  it('parses adversarial input in linear time (ReDoS guard)', () => {
    // The previous lookahead regex exhibited catastrophic backtracking on
    // inputs with many unbalanced quotes/spaces. The linear scan must stay
    // fast regardless of input shape.
    const adversarial = 'a ' + '"'.repeat(50000) + ' '.repeat(50000);
    const start = performance.now();
    parseFilterValue(adversarial);
    expect(performance.now() - start).toBeLessThan(1000);
  });
});

describe('mergeFilterValues', () => {
  it('should merge filter strings with & operator', () => {
    const filters = ['name ilike "%test%"', 'status == "active"'];
    const result = mergeFilterValues(filters, '&');
    expect(result).toBe('(name ilike "%test%")&(status == "active")');
  });

  it('should merge filter strings with | operator', () => {
    const filters = ['name ilike "%test%"', 'status == "active"'];
    const result = mergeFilterValues(filters, '|');
    expect(result).toBe('(name ilike "%test%")|(status == "active")');
  });

  it('should filter out empty, null, and undefined values', () => {
    const filters = [
      'name ilike "%test%"',
      null,
      undefined,
      '',
      'status == "active"',
    ];
    expect(mergeFilterValues(filters, '&')).toBe(
      '(name ilike "%test%")&(status == "active")',
    );
  });

  it('should return undefined when all filters are empty', () => {
    expect(mergeFilterValues([null, undefined, ''], '&')).toBeUndefined();
  });

  it('should handle single filter', () => {
    expect(mergeFilterValues(['name ilike "%test%"'], '&')).toBe(
      '(name ilike "%test%")',
    );
  });

  it('should handle empty array', () => {
    expect(mergeFilterValues([], '&')).toBeUndefined();
  });
});

/** The full string -> tokens -> string cycle a shared link goes through. */
const roundTrip = (
  filterProperties: Array<FilterProperty>,
  value: string | undefined,
) => {
  const specs = buildFieldSpecs(filterProperties, value);
  const { filters, rawValues } = parseFilterString(value, specs);
  return serializeFilters(filters, specs, rawValues);
};

// One property set per page that mounts `BAIPropertyFilter`, transcribed from
// the call site, paired with a filter string that page can produce.
const PAGE_FIXTURES: Array<{
  page: string;
  filterProperties: Array<FilterProperty>;
  filters: Array<string>;
}> = [
  {
    page: 'VFolderNodeListPage / AdminVFolderNodeListPage',
    filterProperties: [
      { key: 'name', propertyLabel: 'Name', type: 'string' },
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'string',
        strictSelection: true,
        defaultOperator: '==',
        options: [
          { label: 'ready', value: 'ready' },
          { label: 'delete-pending', value: 'delete-pending' },
        ],
      },
      { key: 'host', propertyLabel: 'Location', type: 'string' },
      {
        key: 'ownership_type',
        propertyLabel: 'Type',
        type: 'string',
        strictSelection: true,
        defaultOperator: '==',
        options: [
          { label: 'user', value: 'user' },
          { label: 'group', value: 'group' },
        ],
      },
    ],
    filters: [
      'name ilike "%project-data%"',
      'name ilike "%data%" & status == "ready"',
      'name ilike "%my folder%" & host ilike "%local:volume1%" & ownership_type == "group"',
    ],
  },
  {
    page: 'ImageList',
    filterProperties: [
      {
        key: 'id',
        propertyLabel: 'ID',
        type: 'string',
        defaultOperator: '==',
      },
      { key: 'name', propertyLabel: 'Name', type: 'string' },
      {
        key: 'architecture',
        propertyLabel: 'Architecture',
        type: 'string',
        strictSelection: true,
        defaultOperator: '==',
        options: [
          { label: 'x86_64', value: 'x86_64' },
          { label: 'aarch64', value: 'aarch64' },
        ],
      },
      { key: 'is_local', propertyLabel: 'Local', type: 'boolean' },
    ],
    filters: [
      'name ilike "%python%"',
      'architecture == "aarch64" & is_local == true',
      'id == "abc-123" & name ilike "%ngc%" & is_local == false',
    ],
  },
  {
    page: 'AgentList / AgentSummaryList',
    filterProperties: [
      { key: 'id', propertyLabel: 'ID', type: 'string' },
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'string',
        strictSelection: true,
        defaultOperator: '==',
        options: [
          { label: 'ALIVE', value: 'ALIVE' },
          { label: 'LOST', value: 'LOST' },
        ],
      },
      { key: 'schedulable', propertyLabel: 'Schedulable', type: 'boolean' },
    ],
    filters: [
      'id ilike "%agent-01%"',
      'status == "ALIVE" & schedulable == true',
    ],
  },
  {
    page: 'ComputeSessionListPage / AdminComputeSessionListPage',
    filterProperties: [
      { key: 'name', propertyLabel: 'Session Name', type: 'string' },
      {
        key: 'project_id',
        propertyLabel: 'Project',
        type: 'string',
        defaultOperator: '==',
        // The page supplies a Relay-backed picker here; serialization is
        // unaffected by the editor, so the fixture only needs the shape.
        renderInput: () => null,
      },
    ],
    filters: [
      'name ilike "%training%"',
      'name ilike "%job%" & project_id == "3f1c0e7a-0000-4000-8000-000000000001"',
    ],
  },
  {
    page: 'ProjectPage',
    filterProperties: [
      { key: 'name', propertyLabel: 'Name', type: 'string' },
      { key: 'is_active', propertyLabel: 'Active', type: 'boolean' },
    ],
    filters: [
      'name ilike "%default%"',
      'name ilike "%ml%" & is_active == true',
    ],
  },
  {
    page: 'ContainerRegistryList',
    filterProperties: [
      { key: 'registry_name', propertyLabel: 'Registry Name', type: 'string' },
      { key: 'url', propertyLabel: 'URL', type: 'string' },
    ],
    filters: [
      'registry_name ilike "%docker%"',
      'registry_name ilike "%cr%" & url ilike "%index.docker.io%"',
    ],
  },
  {
    page: 'AdminUserCredentialList',
    filterProperties: [
      { key: 'email', propertyLabel: 'User ID', type: 'string' },
      {
        key: 'is_active',
        propertyLabel: 'Active',
        type: 'boolean',
        defaultOperator: '==',
      },
    ],
    filters: [
      'email ilike "%@lablup.com%"',
      'email ilike "%admin%" & is_active == true',
    ],
  },
  {
    page: 'StorageProxyList',
    filterProperties: [
      { key: 'id', propertyLabel: 'ID', type: 'string' },
      { key: 'backend', propertyLabel: 'Backend', type: 'string' },
    ],
    filters: ['id ilike "%local%"', 'backend ilike "%vfs%"'],
  },
  {
    page: 'ReservoirAuditLogList',
    filterProperties: [
      { key: 'artifactName', propertyLabel: 'Artifact', type: 'string' },
      {
        key: 'action',
        propertyLabel: 'Action',
        type: 'string',
        strictSelection: true,
        defaultOperator: '==',
        options: [
          { label: 'IMPORT', value: 'IMPORT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
    ],
    filters: [
      'artifactName ilike "%llama%"',
      'artifactName ilike "%gpt%" & action == "IMPORT"',
    ],
  },
];

describe('URL filter round-trip (no shared-link regression)', () => {
  it.each(
    PAGE_FIXTURES.flatMap(({ page, filterProperties, filters }) =>
      filters.map((filter) => ({ page, filterProperties, filter })),
    ),
  )('$page — $filter', ({ filterProperties, filter }) => {
    expect(roundTrip(filterProperties, filter)).toBe(filter);
  });

  it('re-parses what it emitted (tokens are stable across a second cycle)', () => {
    const { filterProperties } = PAGE_FIXTURES[0];
    const first =
      'name ilike "%data%" & status == "ready" & host ilike "%local%"';
    const second = roundTrip(filterProperties, first);
    expect(roundTrip(filterProperties, second)).toBe(first);
  });

  it('keeps an empty filter empty', () => {
    expect(roundTrip(PAGE_FIXTURES[0].filterProperties, undefined)).toBe(
      undefined,
    );
    expect(roundTrip(PAGE_FIXTURES[0].filterProperties, '')).toBe(undefined);
  });
});

describe('round-trip edge cases the antd implementation also had to survive', () => {
  const properties: Array<FilterProperty> = [
    { key: 'name', propertyLabel: 'Name', type: 'string' },
    { key: 'is_local', propertyLabel: 'Local', type: 'boolean' },
  ];

  it('preserves an asymmetric wildcard instead of widening it to %value%', () => {
    // `ilike "%foo"` is a suffix match. Unwrapping for display and naively
    // re-wrapping would emit `"%foo%"` and silently broaden the query.
    expect(roundTrip(properties, 'name ilike "%@example.com"')).toBe(
      'name ilike "%@example.com"',
    );
  });

  it('leaves boolean values unquoted and string values quoted', () => {
    expect(roundTrip(properties, 'is_local == true')).toBe('is_local == true');
    expect(roundTrip(properties, 'name == "exact"')).toBe('name == "exact"');
  });

  it('preserves a condition whose property is not configured', () => {
    // Old links (and hand-written ones) can name a property this build no
    // longer declares. The token is synthesised so it stays visible/removable
    // and re-serializes verbatim.
    expect(
      roundTrip(properties, 'name ilike "%a%" & legacy_field == "x"'),
    ).toBe('name ilike "%a%" & legacy_field == "x"');
  });

  it('preserves an operator the configured field does not offer', () => {
    expect(roundTrip(properties, 'name >= "2021-01-01"')).toBe(
      'name >= "2021-01-01"',
    );
  });

  it('preserves values containing whitespace', () => {
    expect(roundTrip(properties, 'name ilike "%hello world%"')).toBe(
      'name ilike "%hello world%"',
    );
  });

  it('drops a condition with an empty value (as the antd tag list did)', () => {
    expect(roundTrip(properties, 'name ilike "%%"')).toBe(undefined);
  });
});

describe('buildFieldSpecs / defaultContentSearchFieldKey', () => {
  const properties: Array<FilterProperty> = [
    {
      key: 'status',
      propertyLabel: 'Status',
      type: 'string',
      strictSelection: true,
      defaultOperator: '==',
      options: [{ label: 'ALIVE', value: 'ALIVE' }],
    },
    { key: 'name', propertyLabel: 'Name', type: 'string' },
  ];

  it('routes bare text to the first free-text property (antd preselect parity)', () => {
    expect(defaultContentSearchFieldKey(properties)).toBe('name');
  });

  it('offers the declared default operator first', () => {
    const specs = buildFieldSpecs(properties, undefined);
    expect(specs[0].defaultOperator).toBe('==');
    expect(specs[0].operators[0]).toBe('==');
    expect(specs[1].defaultOperator).toBe('ilike');
  });

  it('widens a field with an operator seen only in the inbound value', () => {
    const specs = buildFieldSpecs(properties, 'name >= "x"');
    const name = specs.find((spec) => spec.key === 'name');
    expect(name?.operators).toContain('>=');
  });
});

describe('number / datetime / uuid properties', () => {
  const properties: Array<FilterProperty> = [
    { key: 'name', propertyLabel: 'Name', type: 'string' },
    { key: 'priority', propertyLabel: 'Priority', type: 'number' },
    { key: 'created_at', propertyLabel: 'Created At', type: 'datetime' },
    { key: 'user_id', propertyLabel: 'User ID', type: 'uuid' },
  ];

  it('offers comparison operators, defaulting to == for numbers', () => {
    const specs = buildFieldSpecs(properties, undefined);
    const priority = specs.find((spec) => spec.key === 'priority');
    expect(priority?.defaultOperator).toBe('==');
    expect(priority?.operators).toEqual(['==', '!=', '>', '>=', '<', '<=']);
  });

  it('offers range operators, defaulting to >= for datetimes', () => {
    const specs = buildFieldSpecs(properties, undefined);
    const createdAt = specs.find((spec) => spec.key === 'created_at');
    expect(createdAt?.defaultOperator).toBe('>=');
    expect(createdAt?.operators).toEqual(['>=', '<=', '==', '!=']);
  });

  it('leaves number values unquoted (the DSL parses them as numbers)', () => {
    expect(roundTrip(properties, 'priority == 10')).toBe('priority == 10');
    expect(roundTrip(properties, 'priority >= -1')).toBe('priority >= -1');
  });

  it('quotes datetime values (the backend parses the string into a date)', () => {
    expect(roundTrip(properties, 'created_at >= "2026-08-01"')).toBe(
      'created_at >= "2026-08-01"',
    );
    expect(roundTrip(properties, 'created_at == "2026-08-01T00:00:00"')).toBe(
      'created_at == "2026-08-01T00:00:00"',
    );
  });

  it('serializes a freshly committed typed token, not just a round-tripped one', () => {
    // What the `float` / `date_absolute` editors hand back when the user picks
    // a value, so the DSL stays legal without a round trip to lean on.
    const specs = buildFieldSpecs(properties, undefined);
    expect(
      serializeFilters(
        [
          {
            field: 'priority',
            operator: '>=',
            value: { type: 'float', value: 3 },
          },
          {
            field: 'created_at',
            operator: '>=',
            value: { type: 'date_absolute', unixSeconds: 1767225600 },
          },
        ],
        specs,
      ),
    ).toBe('priority >= 3 & created_at >= "2026-01-01T00:00:00.000Z"');
  });

  it('offers equality only for uuid (a UUID column has no ilike)', () => {
    const specs = buildFieldSpecs(properties, undefined);
    const userId = specs.find((spec) => spec.key === 'user_id');
    expect(userId?.defaultOperator).toBe('==');
    expect(userId?.operators).toEqual(['==', '!=']);
    expect(roundTrip(properties, 'user_id == "a-uuid"')).toBe(
      'user_id == "a-uuid"',
    );
  });

  it('still routes bare typed text to the first free-text property', () => {
    expect(defaultContentSearchFieldKey(properties)).toBe('name');
  });
});

describe('BAIPropertyFilter render', () => {
  it('renders the PowerSearch input with the supplied placeholder', () => {
    render(
      <BAIPropertyFilter
        data-testid="property-filter"
        placeholder="Search folders"
        filterProperties={PAGE_FIXTURES[0].filterProperties}
        value={'name ilike "%data%"'}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('property-filter')).toBeInTheDocument();
  });
});

/*
 FR-3739 — guards `react/patches/@astryxdesign__core@0.5.0.patch`.

 Astryx's `useFocusTrap` restored focus to whatever held it before the trap
 activated whenever focus "would otherwise be lost". The suggestion popover
 opens with `role: 'none'` + `hasAutoFocus: false`, so the input keeps focus
 the whole time and the trap never holds it — the restore then re-focused the
 input the dismissal had just blurred, and because the input was already
 focused, clicking it again fired no `focus` event and the menu stayed shut.

 The patch skips the restore when focus never entered the trap container. The
 first test is the bug; the second is the behaviour the patch must NOT break —
 a popup that does take focus still restores it.
*/
describe('BAIPropertyFilter dismissal (FR-3739)', () => {
  const filterProperties: Array<FilterProperty> = [
    { key: 'name', propertyLabel: 'Name', type: 'string' },
    { key: 'status', propertyLabel: 'Status', type: 'string' },
  ];

  const renderFilter = () => {
    render(
      <BAIPropertyFilter
        filterProperties={filterProperties}
        value=""
        onChange={() => {}}
      />,
    );
    return screen.getByRole('combobox');
  };

  it('releases input focus when the suggestions are dismissed', async () => {
    const input = renderFilter();

    input.focus();
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    // What an outside click does: the browser blurs the input, and the layer
    // closes. Unpatched, the focus-trap teardown put focus straight back.
    input.blur();
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(document.activeElement).not.toBe(input);
  });

  it('reopens the suggestions when the released input is focused again', async () => {
    const input = renderFilter();

    input.focus();
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    input.blur();
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );

    input.focus();
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  });

  it('still restores focus to the trigger of a popup that takes focus', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button" data-testid="outside">
          outside
        </button>
        <BAIPopconfirm
          title="Delete this?"
          onConfirm={() => {}}
          okText="Delete"
          cancelText="Cancel"
        >
          <button type="button" data-testid="trigger">
            trigger
          </button>
        </BAIPopconfirm>
      </>,
    );

    const trigger = screen.getByTestId('trigger');
    await user.click(trigger);
    const cancel = await screen.findByRole('button', { name: 'Cancel' });

    // Focus genuinely enters this popup, so the trap owns it and must hand it
    // back to the trigger when the popup closes.
    cancel.focus();
    expect(document.activeElement).toBe(cancel);
    await user.click(cancel);

    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
