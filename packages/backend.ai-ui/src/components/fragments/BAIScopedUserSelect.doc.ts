import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIScopedUserSelect',
  displayName: 'BAI Scoped User Select',
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
    'project members',
    'domain users',
    'ADR 0012',
    'scopedUsersV2',
  ],
  usage: {
    description:
      'The user picker behind the keypair, credential, deployment, project-admin and storage-permission forms, and the reference consumer of BAIComplexSelect. It pages scopedUsersV2 (ADR 0012) with the required scope prop, typed as the query\'s UserScope input: an admin page passes the current domain from the host\'s useCurrentDomain() id, a project-admin page passes { project: [{ value: projectId }] }. The component does no scope lookup of its own, so it suspends only for the value query, and a caller that renders it lazily, such as a filter popover, wraps it in Suspense. RBAC management keeps BAIAdminUserV2Select over adminUsersV2, because its users are not bound to one domain (ADR 0012). The paginated document pages the scoped connection ten rows at a time with limit/offset, ordered by EMAIL ascending, and compiles the debounced search text into an email iContains predicate; the value document re-resolves the selected id(s) into emails through a uuid in filter. That second query is load-bearing rather than cosmetic — the trigger reads its text from the value, and a user chosen on page one is no longer in options once loadNext has paged past it — but it only runs under valuePropName="id", because with emails the key already is the label. The option list is fetched when the popup opens, and the trigger shows a loading state while that fetch is in flight, so nothing suspends on mount for it. scopedUsersV2 exists on managers 26.9.0 and later; there is no fallback for older managers. The outer value stays a plain key — the email by default, or the local user UUID when valuePropName is "id" — and label-in-value stays inside the wrapper, except that onChange also hands back the matching label pair. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, width, isDisabled and status; options, value, onChange, searchValue, onSearch and total are owned here.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass { domain: [{ value: id }] } from useCurrentDomain() on an admin page, and { project: [{ value: projectId }] } on a project-admin page.',
      },
      {
        guidance: true,
        description:
          'Wrap it in Suspense where it mounts lazily (a filter popover, a modal field); the value query suspends when valuePropName="id" starts with a value.',
      },
      {
        guidance: false,
        description:
          'Use it on RBAC management screens; they list users across domains and keep BAIAdminUserV2Select.',
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
      type: 'UserScope',
      required: true,
      description:
        'The users to list, as the scopedUsersV2 scope input: { domain: [{ value: domainUUID }] }, { project: [{ value: projectUUID }] }, or several, combined with OR.',
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
      type: 'BAIScopedUserSelectFilter',
      description:
        'Extra UserV2Filter input, combined under AND with the status and email predicates in both the paginated option query and the value-resolution query, so a value outside the filter stays unresolved and falls back to printing its key.',
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
      type: 'React.Ref<BAIScopedUserSelectRef>',
      description:
        'Imperative handle exposing refetch(), which updates the shared fetch key of the paginated and value queries inside a transition.',
    },
  ],
  examples: [
    {
      label: 'User field in a credential form (current domain)',
      code: `const { id } = useCurrentDomain();
const domainScope = { domain: [{ value: id }] };

<Form.Item name="user_id" label={t('general.User')}>
  <BAIScopedUserSelect
    scope={domainScope}
    label={t('general.User')}
    isLabelHidden
  />
</Form.Item>`,
    },
    {
      label: 'Owner filter on a project-admin page',
      code: `<Suspense fallback={<BAISkeleton variant="input" width={200} />}>
  <BAIScopedUserSelect
  scope={{ project: [{ value: projectId }] }}
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
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
