import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIUserSelect',
  displayName: 'BAI User Select',
  category: 'Data Input',
  keywords: [
    'user',
    'user picker',
    'account',
    'email',
    'select',
    'combobox',
    'paginated select',
    'relay',
  ],
  usage: {
    description:
      'The user picker behind the keypair, project-admin, RBAC and storage-permission forms, and the reference consumer of BAIComplexSelect. It runs two Relay queries of its own: BAIUserSelectPaginatedQuery pages user_nodes ten rows at a time ordered by email, with the typed text debounced into an email search predicate, and BAIUserSelectValueQuery re-resolves the selected key(s) into emails. That second query is load-bearing rather than cosmetic — the trigger reads its text from the value, and a user chosen on page one is no longer in options once loadNext has paged past it. Both queries suspend, so the control needs a Suspense boundary above it. The outer value is a plain key — the email by default, or the local user id when valuePropName is "id" — and label-in-value stays inside the wrapper, except that onChange also hands back the matching label pair so a filter chip can show the email while the UUID goes into the GraphQL filter. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, width, isDisabled and status; options, value, onChange, searchValue, onSearch and total are owned here.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — both queries suspend on first load.',
      },
      {
        guidance: true,
        description:
          'Pass label on every instance and add isLabelHidden inside a form item or filter row, since BAIComplexSelect requires an accessible name.',
      },
      {
        guidance: true,
        description:
          'Set valuePropName="id" whenever the value is written into a GraphQL mutation or scope field that expects a user UUID, and leave the default when the API takes an email.',
      },
      {
        guidance: true,
        description:
          'Use excludeInactive on forms that assign work to a person, so deactivated accounts are filtered out server-side.',
      },
      {
        guidance: true,
        description:
          'Take the label from the second onChange argument when a filter chip or summary needs the human-readable email; it cannot be derived from the key at the call site.',
      },
      {
        guidance: false,
        description:
          'Expect the second onChange argument to be a single pair under multiple — it mirrors the value, so it is an array there and a single pair otherwise.',
      },
      {
        guidance: false,
        description:
          'Search by username or full name: the search text is compiled into an email predicate only, even though full_name is shown as an option description.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected key, or keys when multiple is set. The key is an email, or a local user id when valuePropName is "id". Omit it and the component keeps the selection itself.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void',
      description:
        'Fired with the new key, or array of keys under multiple. The second argument is the matching label/value pair — an array in multiple mode — so a caller can display the email without a second lookup.',
    },
    {
      name: 'valuePropName',
      type: "'id' | 'email'",
      description:
        'Which user field becomes the outer key. With "id" the Relay global id is converted to the local UUID, and the value query filters on uuid instead of email.',
      default: "'email'",
    },
    {
      name: 'filter',
      type: 'string',
      description:
        'Extra Backend.AI query-filter expression, merged into both the paginated option query and the value-resolution query, so a value outside the filter stays unresolved and falls back to printing its key.',
    },
    {
      name: 'excludeInactive',
      type: 'boolean',
      description:
        'Adds a status == "active" predicate to the same merged filter, hiding deactivated accounts from the list and from label resolution.',
      default: 'false',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: value and onChange become arrays and the trigger lists the selected emails.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Caller-side loading flag, combined with the internal pending states (deferred value, debounced search, in-flight refetch) that already spin the trigger.',
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controlled popup state. It also drives the option query fetch policy, which is network-only while open and store-only while closed.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: 'Initial popup state for the uncontrolled case.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Applied before the prop spread, so a call site can override the translated default.',
      default: "t('comp:BAIUserSelect.SelectUser')",
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIUserSelectRef>',
      description:
        'Imperative handle exposing refetch(), which updates the shared fetch key of the paginated and value queries inside a transition.',
    },
  ],
  examples: [
    {
      label: 'User field in a keypair form',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIFormItem name="user_id" label={t('general.User')}>
    <BAIUserSelect
      label={t('general.User')}
      isLabelHidden
      placeholder={t('credential.SelectUser')}
    />
  </BAIFormItem>
</Suspense>`,
    },
    {
      label: 'Filter condition that keeps the email on the chip',
      code: `<BAIUserSelect
  // The filter row already prints the property label.
  label={t('storageHost.permission.User')}
  isLabelHidden
  valuePropName="id"
  value={null}
  onChange={(value, option) =>
    onAddCondition(
      value as string | undefined,
      _.castArray(option ?? [])[0]?.label,
    )
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
