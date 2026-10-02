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
    'project members',
    'scopedUsersV2',
  ],
  usage: {
    description:
      "The user picker behind the keypair, credential, RBAC, deployment, project-admin and storage-permission forms, and the reference consumer of BAIComplexSelect. It pages scopedUsersV2, whose result follows the requester's permissions, so one component serves every page: with projectId it lists that project's members, with domainId that domain's users, and with neither the users of the current domain (the WebUI assumes a single domain). UserScope takes the domain UUID while the client only knows the current domain's name, so that last case first resolves it through domainV2 (BAIUserSelectCurrentDomainQuery). The lookup and the value query suspend inside the component's own Suspense boundary, which shows a disabled loading picker, so a filter popover hosting it is not unmounted by a page-level fallback. The paginated document pages the scoped connection ten rows at a time with limit/offset, ordered by EMAIL ascending, and compiles the debounced search text into an email iContains predicate; the value document re-resolves the selected id(s) into emails through a uuid in filter. That second query is load-bearing rather than cosmetic — the trigger reads its text from the value, and a user chosen on page one is no longer in options once loadNext has paged past it — but it only runs under valuePropName=\"id\", because with emails the key already is the label. The option list is fetched when the popup opens, and the trigger shows a loading state while that fetch is in flight, so nothing suspends on mount for it. scopedUsersV2 and DomainV2.entityId exist on managers 26.9.0 and later; there is no fallback for older managers. The outer value stays a plain key — the email by default, or the local user UUID when valuePropName is \"id\" — and label-in-value stays inside the wrapper, except that onChange also hands back the matching label pair. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, width, isDisabled and status; options, value, onChange, searchValue, onSearch and total are owned here.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Pass projectId on a project-admin screen to list that project's members; leave both scope props out on an admin page to list the current domain's users.",
      },
      {
        guidance: true,
        description:
          'Render it directly in a filter popover or form item; it carries its own Suspense boundary, so no wrapper is needed.',
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
      name: 'projectId',
      type: 'string',
      description:
        'Lists the members of this project (project UUID) through a project UserScope. Takes precedence over domainId.',
    },
    {
      name: 'domainId',
      type: 'string',
      description:
        'Lists the users of this domain (domain UUID). When neither projectId nor domainId is given, the current domain is used.',
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
      type: 'React.Ref<BAIUserSelectRef>',
      description:
        'Imperative handle exposing refetch(), which updates the shared fetch key of the paginated and value queries inside a transition.',
    },
  ],
  examples: [
    {
      label: 'Multi-user field in an assign-role modal (current domain)',
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
  projectId={projectId}
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
