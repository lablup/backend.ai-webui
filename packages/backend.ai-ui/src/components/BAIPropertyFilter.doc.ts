import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIPropertyFilter',
  displayName: 'BAI Property Filter',
  category: 'Data Input',
  keywords: [
    'filter',
    'search',
    'power search',
    'query builder',
    'facet',
    'token',
    'search bar',
  ],
  usage: {
    description:
      'The token-based filter bar above a list or table. It renders Astryx PowerSearch and adds the one thing PowerSearch does not know about: the Backend.AI queryfilter minilang. Its value is that filter string (`name ilike "%foo%" & status == "READY"`), which is simultaneously the GraphQL filter variable and the page URL state, so parsing and serialization are exact inverses — an unknown property or operator from an older shared link is synthesised into the field list instead of being dropped, and an asymmetric wildcard such as `ilike "%foo"` re-emits verbatim rather than silently widening. Tokens are derived from value on every render, so there is no local copy to drift. Use BAIGraphQLPropertyFilter instead on a surface whose filter is a GraphQL filter object rather than a DSL string. Chrome props (label, placeholder, size, and the rest) come from BAIPowerSearchChromeProps.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep value in the URL and pass it back in, so a filtered view survives a reload and can be shared.',
      },
      {
        guidance: true,
        description:
          'Give each property the type that matches its column — number and boolean serialize bare, datetime and uuid stay quoted, and the type also picks the value editor and the operator menu.',
      },
      {
        guidance: true,
        description:
          'Use renderInput with an existing select (BAIUserSelect, for example) when the raw value is opaque, and pass the human-readable label to onAddCondition so the token shows the label while the UUID still serializes.',
      },
      {
        guidance: true,
        description:
          'Set strictSelection alongside options for a fixed vocabulary — that is what turns the field into an enum with the == / != operators only.',
      },
      {
        guidance: false,
        description:
          'Treat rule.validate as a gate: a violation surfaces as the control error status and the token still commits.',
      },
      {
        guidance: false,
        description:
          'Add a reset button next to the control; PowerSearch already ships the clear affordance.',
      },
      {
        guidance: false,
        description:
          'Hand-assemble the filter string at the call site — use mergeFilterValues to AND this control output together with any page-level filter.',
      },
    ],
  },
  props: [
    {
      name: 'filterProperties',
      type: 'Array<FilterProperty>',
      description:
        'The filterable fields. Each entry declares key (the DSL property name), propertyLabel, type, and optionally defaultOperator, options, strictSelection, rule, and renderInput.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description:
        'The filter string in the Backend.AI queryfilter minilang. Controlled: the tokens shown are parsed from it on every render.',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description:
        'Called with the re-serialized filter string whenever a token is added, edited or removed. Undefined arrives as an empty filter.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description: 'Initial filter string for the uncontrolled case.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Disables the control while the filtered query is in flight, together with isDisabled.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the search input. Falls back to the package translation.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Text shown while no token is present. Falls back to the package translation.',
    },
    {
      name: 'applyLabel',
      type: 'string',
      description:
        'Label of the confirm button in the token edit popover. Falls back to the translated "Apply".',
    },
    {
      name: 'contentSearchFieldKey',
      type: 'string',
      description:
        'Property that bare, un-prefixed typing is committed against. Defaults to the first free-text property, reproducing the preselected-property behaviour of the older filter.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the whole control.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Control height, on the Astryx sizing scale.',
    },
    {
      name: 'resultCount',
      type: 'string',
      description:
        'Pre-formatted result count. Deprecated and inert — power search shows no count; the prop is kept only for source compatibility.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style on the control. Call sites typically set flex: 1 so the bar fills its toolbar row.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the control.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test hook forwarded to the rendered PowerSearch.',
    },
  ],
  examples: [
    {
      label: 'Filter bar over a list query',
      code: `<BAIPropertyFilter
  filterProperties={[
    {
      key: 'email',
      propertyLabel: t('credential.UserID'),
      type: 'string',
    },
    {
      key: 'is_admin',
      propertyLabel: t('credential.Admin'),
      type: 'boolean',
    },
  ]}
  value={filter}
  onChange={setFilter}
/>`,
    },
    {
      label: 'Enum property with a fixed vocabulary',
      code: `<BAIPropertyFilter
  filterProperties={[
    {
      key: 'status',
      propertyLabel: t('session.Status'),
      type: 'string',
      strictSelection: true,
      options: [
        { label: 'RUNNING', value: 'RUNNING' },
        { label: 'TERMINATED', value: 'TERMINATED' },
      ],
    },
  ]}
  value={filter}
  onChange={setFilter}
  style={{ flex: 1 }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
