import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIStorageHostSelect',
  displayName: 'BAI Storage Host Select',
  category: 'Data Input',
  keywords: [
    'storage host',
    'volume',
    'vfolder host',
    'select',
    'combobox',
    'paginated select',
    'relay',
  ],
  usage: {
    description:
      'The storage-host picker for filter rows, RBAC scope forms and storage settings panels. It is a BAIComplexSelect wrapper that owns two Relay queries: BAIStorageHostSelectPaginatedQuery pages storage_volume_list ten rows at a time with a server-side id search, and BAIStorageHostSelectValueQuery re-resolves the currently selected id(s) so the trigger keeps a readable label after loadNext has paged past the chosen row. Both are useLazyLoadQuery calls, so the control suspends on first render and needs a Suspense boundary above it. The outer value contract is the plain storage host id — a string, or an array of strings under multiple — with the label-in-value pairing confined to the wrapper. The rest of BAIComplexSelectProps passes through unchanged, including the required label, isLabelHidden, width, status and isDisabled; only options, value, onChange, searchValue, onSearch and total are removed from the props type because this component supplies them.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — both of its queries suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Pass label on every instance and add isLabelHidden inside a filter row or form item, since BAIComplexSelect needs an accessible name and the surrounding row usually prints the visible one.',
      },
      {
        guidance: true,
        description:
          'Narrow the list with filter written in the Backend.AI query-filter minilang; it is merged with the search predicate instead of replacing it.',
      },
      {
        guidance: true,
        description:
          'Hold a BAIStorageHostSelectRef and call refetch() when storage hosts change elsewhere on the page — it bumps the fetch key of both queries inside a transition.',
      },
      {
        guidance: false,
        description:
          'Expect a monospace host label: BAIComplexSelect labels must be plain strings, so the trigger and every option row print the host id as ordinary text.',
      },
      {
        guidance: false,
        description:
          'Read a second option argument in onChange — the callback carries the key alone, and only BAIUserSelect passes the label-in-value pair.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected storage host id, or ids when multiple is set. Plain keys, so a form field stores exactly what the API expects. Omit it and the component keeps the selection itself.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new host id, or the array of ids under multiple. It carries no second option argument.',
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Extra Backend.AI query-filter expression merged into the paginated option query alongside the search predicate. It does not narrow the value-resolution query, so an already-selected host outside the filter still resolves its label.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: value and onChange become arrays and the trigger lists the selected labels.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Caller-side loading flag, combined with the internal pending states (deferred value, debounced search, in-flight refetch) that already spin the trigger.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Applied before the prop spread, so a call site can override the translated default.',
      default: "t('comp:BAIStorageHostSelect.SelectStorageHost')",
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIStorageHostSelectRef>',
      description:
        'Imperative handle exposing refetch(), which updates the shared fetch key of the paginated and value queries inside a transition.',
    },
  ],
  examples: [
    {
      label: 'Storage host condition in a property filter row',
      code: `<BAIStorageHostSelect
  // The filter row already prints the property label.
  label={t('import.StorageHost')}
  isLabelHidden
  value={null}
  onChange={(value) => onAddCondition(value as string | undefined)}
/>`,
    },
    {
      label: 'Scope picker behind a Suspense boundary',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIStorageHostSelect
    label={t('rbac.ScopeStorageHost')}
    isLabelHidden
    value={scopeId}
    onChange={(value) => setScopeId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
