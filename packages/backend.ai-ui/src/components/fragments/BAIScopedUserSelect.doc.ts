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
    'scopedUsersV2',
    'scope',
    'domain',
    'project',
    'role',
    'v2',
  ],
  usage: {
    description:
      'The user picker over the scopedUsersV2 connection (managers >= 26.9.0), and the scoped sibling of BAIAdminUserV2Select: the same BAIComplexSelect foundation, the same plain-key value contract and the same UserV2Filter object, but the rows are the users the named scopes reach, so an ordinary user can call it where adminUsersV2 would be refused. The scope is built from the domainId, projectId and roleId props — each takes one id or several, and a key a caller leaves out is left out of the UserScope input rather than sent empty; the server combines the named scopes with OR and authorizes each one. It runs two Relay queries of its own: BAIScopedUserSelectPaginatedQuery pages scopedUsersV2 ten rows at a time with limit/offset, ordered by EMAIL ascending, and compiles the debounced search text into an email iContains predicate; BAIScopedUserSelectValueQuery re-resolves the selected id(s) into emails through a uuid in filter under the same scope. That second query is load-bearing rather than cosmetic — the trigger reads its text from the value, and a user chosen on page one is no longer in options once loadNext has paged past it — but it only runs under valuePropName="id", because with emails the key already is the label and StringFilter has no in. The option list is fetched when the popup opens, and the trigger shows a loading state while that fetch is in flight, so nothing suspends on mount for it; only the value query can suspend on mount, and only when valuePropName="id" starts with a value already set. With allowCustomSelect, an e-mail address typed in the search box that no listed user matches is offered as one more option, so an address outside the scope can still be picked: its value is that address and the option handed to onChange carries isCustom, while a listed user’s option carries its local userId. The outer value stays a plain key — the email by default, or the local user UUID when valuePropName is "id" — and label-in-value stays inside the wrapper, except that onChange also hands back the matching label pair. The rest of BAIComplexSelectProps passes through, including the required label, isLabelHidden, width, isDisabled and status; options, value, onChange, searchValue, onSearch and total are owned here.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Name at least one scope — domainId, projectId or roleId — on every instance; an empty UserScope reaches no users.',
      },
      {
        guidance: true,
        description:
          'Wrap it, or the form item holding it, in a Suspense boundary when valuePropName="id" and a value is preset — that resolution query suspends on mount. The option list needs none: it is fetched when the popup opens and the trigger shows a loading state meanwhile.',
      },
      {
        guidance: true,
        description:
          'Pass label on every instance and add isLabelHidden inside a form item or filter row, since BAIComplexSelect requires an accessible name.',
      },
      {
        guidance: true,
        description:
          'Set valuePropName="id" whenever the value feeds a V2 mutation input such as setVFolderMountPolicy, which takes user UUIDs.',
      },
      {
        guidance: true,
        description:
          'Build filter as a UserV2Filter object (for example { role: { equals: "USER" } }); it is merged with the search and status predicates under AND.',
      },
      {
        guidance: true,
        description:
          'Set allowCustomSelect on an invite field that must also take an address the scope cannot see, and read isCustom / userId off the second onChange argument to tell the two apart.',
      },
      {
        guidance: false,
        description:
          'Reach for it to list every account on the deployment: that is BAIAdminUserV2Select over adminUsersV2, which needs a superadmin. This one lists the users a scope reaches, and the caller must be allowed to read that scope.',
      },
      {
        guidance: false,
        description:
          'Pass a Backend.AI query-filter string to filter — that is BAIUserSelect’s shape; this component takes the typed V2 filter input.',
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
      name: 'domainId',
      type: 'string | Array<string> | null',
      description:
        'Domain id(s) whose users are listed. Each id becomes a UUIDScope entry under scope.domain; omit it to leave the domain key out of the scope.',
    },
    {
      name: 'projectId',
      type: 'string | Array<string> | null',
      description:
        'Project id(s) whose users are listed. Each id becomes a UUIDScope entry under scope.project; omit it to leave the project key out of the scope.',
    },
    {
      name: 'roleId',
      type: 'string | Array<string> | null',
      description:
        'Role id(s) whose holders are listed. Each id becomes a UUIDScope entry under scope.role; omit it to leave the role key out of the scope.',
    },
    {
      name: 'allowCustomSelect',
      type: 'boolean',
      description:
        'Offers the typed search text as an option when it is an e-mail address that no listed user matches exactly. Picking it makes the value that address, and the option passed to onChange carries isCustom: true. Only applies under valuePropName "email".',
      default: 'false',
    },
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected key, or keys when multiple is set. The key is an email, or a local user id when valuePropName is "id". Omit it and the component keeps the selection itself.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined, option?: BAIScopedUserSelectOption | Array<BAIScopedUserSelectOption>) => void',
      description:
        'Fired with the new key, or array of keys under multiple. The second argument is the matching label/value pair — an array in multiple mode — plus userId for a listed user or isCustom for an address offered through allowCustomSelect.',
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
      label:
        'Invite field: a member of the caller’s projects, or any e-mail address',
      code: `<BAIScopedUserSelect
  projectId={memberProjectIds}
  allowCustomSelect
  allowClear
  label={t('data.folders.UserOrEmail')}
  isLabelHidden
  value={recipient?.email ?? null}
  onChange={(_value, option) => {
    const picked = _.castArray(option ?? [])[0];
    setRecipient(
      !picked
        ? null
        : picked.userId
          ? { kind: 'user', userId: picked.userId, email: picked.value }
          : { kind: 'email', email: picked.value },
    );
  }}
/>`,
    },
    {
      label: 'Holders of one role across a domain',
      code: `<BAIScopedUserSelect
  domainId={domainId}
  roleId={roleId}
  multiple
  label={t('credential.Users')}
  isLabelHidden
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
