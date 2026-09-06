import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIGraphQLPropertyFilter',
  displayName: 'BAI GraphQL Property Filter',
  category: 'Data Input',
  keywords: [
    'filter',
    'search',
    'power search',
    'query builder',
    'facets',
    'graphql filter',
    'property filter',
  ],
  usage: {
    description:
      'The filter bar above list and table pages. It renders Astryx PowerSearch, and its value is not a query string but a GraphQL filter object ({ name: { iContains: "x" } }, { AND: [...] }) that pages keep in the URL and hand straight to a Relay variable. You describe the filterable columns declaratively through `filterProperties` — key, label, type, allowed operators, enum options — and the component derives the operator menus, the value editors and the token labels from that, converting in both directions losslessly for string, number, boolean, enum, uuid and datetime properties as well as the `in` and `notIn` list operators. Chrome props (label, placeholder, size, style, …) come from BAIPowerSearchChromeProps; its DSL sibling BAIPropertyFilter shares them.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reset table pagination to page 1 and clear the row selection inside `onChange`, since the filter narrows the result set under the current offset.',
      },
      {
        guidance: true,
        description:
          'Parameterize the component with your schema’s concrete filter type so `value` and `onChange` type-check against the Relay variable they feed.',
      },
      {
        guidance: true,
        description:
          'Give an opaque-valued property a `renderInput` and call `onAddCondition(value, label)` with a readable label, so the token shows the label while the raw value still serializes into the filter.',
      },
      {
        guidance: true,
        description:
          'Set `strictSelection` on enum-like properties so a free-text token cannot produce a value the backend will reject.',
      },
      {
        guidance: true,
        description:
          'Place it inside the card body, not in the card’s `extra` slot — it is a content-scoped control, unlike refresh and create actions.',
      },
      {
        guidance: false,
        description:
          'Set a per-property `placeholder` and expect it to appear; PowerSearch has one control-level placeholder and no per-field input to put it in.',
      },
      {
        guidance: false,
        description:
          'Treat a property `rule` as a hard gate — a violation is surfaced as an error status on the control, not refused at commit time.',
      },
    ],
  },
  props: [
    {
      name: 'filterProperties',
      type: 'Array<FilterProperty>',
      description:
        'The filterable columns. Each entry declares `key` (dot paths allowed for nested filters), `propertyLabel`, `type`, and optionally `operators`, `defaultOperator` or `fixedOperator`, `options`, `strictSelection`, `valueMode`, `implicitOperator`, `rule` and `renderInput`.',
      required: true,
    },
    {
      name: 'value',
      type: 'TFilter',
      description:
        'Controlled GraphQL filter object. It is the same shape the Relay query takes, so it can be stored in the URL and passed through unchanged.',
    },
    {
      name: 'onChange',
      type: '(value: TFilter | undefined) => void',
      description:
        'Fired with the rebuilt filter object whenever a token is added, edited or cleared. Emits undefined once no condition remains.',
    },
    {
      name: 'defaultValue',
      type: 'TFilter',
      description:
        'Initial filter for the uncontrolled case, for a page that starts pre-filtered.',
    },
    {
      name: 'combinationMode',
      type: "'AND' | 'OR'",
      description:
        'How multiple conditions are combined in the emitted filter object.',
      default: "'AND'",
    },
    {
      name: 'singleCondition',
      type: 'boolean',
      description:
        'Makes each property hold one condition: committing a value replaces that property’s existing condition instead of appending another.',
      default: 'false',
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Disables the control while the filtered query is in flight, so a second filter cannot be committed against a stale list.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name of the search input. Defaults to the localized search label.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Text shown while no token exists. This is the only placeholder the control has.',
    },
    {
      name: 'applyLabel',
      type: 'string',
      description:
        'Label of the edit popover’s confirm button. Defaults to the localized "Apply".',
    },
    {
      name: 'contentSearchFieldKey',
      type: 'string',
      description:
        'Property that bare, un-prefixed text is committed against. Defaults to the first free-text string property that has neither strict selection nor a custom editor.',
    },
    {
      name: 'resultCount',
      type: 'string',
      description:
        'Pre-formatted result count, passed through as a string so host pluralization wins. Deprecated — power search shows no result count.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the whole control. Combined with `loading`, either one is enough to disable it.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Control height, matched to the toolbar it sits in.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style on the control. Call sites typically pass `flex: 1` so it fills the toolbar row.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the control.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test hook forwarded to PowerSearch.',
    },
  ],
  examples: [
    {
      label: 'Single string property above a table',
      code: `<BAIGraphQLPropertyFilter<ProjectV2Filter>
  style={{ flex: 1 }}
  filterProperties={[
    {
      key: 'name',
      propertyLabel: t('storageHost.permission.Name'),
      type: 'string',
    },
  ]}
  value={filter}
  onChange={(value) => {
    setFilter(value);
    setTablePaginationOption({ current: 1 });
    setSelectedRowKeys([]);
  }}
/>`,
    },
    {
      label: 'Enum property restricted to known values',
      code: `<BAIGraphQLPropertyFilter<PermissionFilter>
  filterProperties={[
    {
      key: 'scopeType',
      propertyLabel: t('rbac.ScopeType'),
      type: 'enum',
      options: scopeTypes.map((type) => ({
        label: t(\`rbac.types.\${type}\`, { defaultValue: type }),
        value: type,
      })),
      strictSelection: true,
    },
  ]}
  value={permissionFilter}
  onChange={setPermissionFilter}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
