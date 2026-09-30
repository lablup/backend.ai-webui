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
    'adminUsersV2',
    'projectUsersV2',
    'domainUsersV2',
  ],
  usage: {
    description:
      'The user picker behind the keypair, project-admin, RBAC, deployment and storage-permission forms, and the reference consumer of BAIComplexSelect. The scope prop decides which V2 connection it pages: adminUsersV2 for every user (super-admin), domainUsersV2 for one domain, or projectUsersV2 for the members of one project; left out, a super-admin lists everyone and anyone else lists their own domain. It runs two Relay queries of its own: BAIUserSelectPaginatedQuery pages the scoped connection ten rows at a time with limit/offset, ordered by EMAIL ascending, and compiles the debounced search text into an email iContains predicate; BAIUserSelectValueQuery re-resolves the selected id(s) into emails through a uuid in filter. That second query is load-bearing rather than cosmetic — the trigger reads its text from the value, and a user chosen on page one is no longer in options once loadNext has paged past it — but it only runs under valuePropName="id", because with emails the key already is the label. The option list is fetched when the popup opens, and the trigger shows a loading state while that fetch is in flight, so nothing suspends on mount for it; only the value query can suspend on mount, and only when valuePropName="id" starts with a value already set. On managers below 26.2.0 (client flag user-v2-query) both queries fall back to the legacy user_nodes connection, where the typed filter does not apply and a project scope lists unscoped. The outer value stays a plain key — the email by default, or the local user UUID when valuePropName is "id" — and label-in-value stays inside the wrapper, except that onChange also hands back the matching label pair. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, width, isDisabled and status; options, value, onChange, searchValue, onSearch and total are owned here.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass scope={{ type: "project", projectId }} on a project-admin screen: adminUsersV2 needs a super-admin, and projectUsersV2 is what a project member may read.',
      },
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary — the client lookup suspends, and so does the value query when valuePropName="id" starts with a value.',
      },
      {
        guidance: true,
        description:
          'Pass label on every instance and add isLabelHidden inside a form item or filter row, since BAIComplexSelect requires an accessible name.',
      },
      {
        guidance: true,
        description:
          'Set valuePropName="id" whenever the value feeds a mutation input or GraphQL filter that takes a user UUID, and leave the default when the API takes an email.',
      },
      {
        guidance: true,
        description:
          'Build filter as a UserV2Filter object (for example { role: { equals: "USER" } }); it is merged with the search and status predicates under AND.',
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
          'Search by username or full name: the search text is compiled into an email predicate only, even though fullName is shown as an option description.',
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
      name: 'scope',
      type: 'BAIUserSelectScope',
      description:
        'Which users to list: { type: "admin" } pages adminUsersV2, { type: "domain", domainName } pages domainUsersV2, { type: "project", projectId } pages projectUsersV2. Omitted, a super-admin lists every user and anyone else their own domain.',
    },
    {
      name: 'valuePropName',
      type: "'id' | 'email'",
      description:
        'Which user field becomes the outer key. With "id" the Relay global id is converted to the local UUID and the value-resolution query runs with a uuid in filter; with "email" that query is skipped entirely.',
      default: "'email'",
    },
    {
      name: 'filter',
      type: 'BAIUserSelectFilter',
      description:
        'Extra UserV2Filter input, combined under AND with the status and email predicates in both the paginated option query and the value-resolution query, so a value outside the filter stays unresolved and falls back to printing its key. Managers below 26.2.0 list without it.',
    },
    {
      name: 'excludeInactive',
      type: 'boolean',
      description:
        'Adds a status equals ACTIVE predicate to the same combined filter, hiding non-active accounts from the list and from label resolution.',
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
      label: 'Multi-user field in an assign-role modal',
      code: `<Form.Item name="userIds" label={t('credential.Users')}>
  <BAIUserSelect
    multiple
    valuePropName="id"
    label={t('credential.Users')}
    isLabelHidden
    placeholder={t('rbac.SelectUsers')}
  />
</Form.Item>`,
    },
    {
      label: 'Owner filter on a project-admin page',
      code: `<BAIUserSelect
  scope={{ type: 'project', projectId }}
  valuePropName="id"
  label={t('session.Owner')}
  isLabelHidden
  value={value}
  onChange={(next, option) =>
    onAddCondition(
      next as string | undefined,
      _.castArray(option ?? [])[0]?.label,
    )
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
