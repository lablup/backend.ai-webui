import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDomainSelect',
  displayName: 'BAI Domain Select',
  category: 'Data Input',
  keywords: ['domain', 'select', 'dropdown', 'picker', 'tenant', 'relay'],
  usage: {
    description:
      'Picks a Backend.AI domain by name. It is self-fetching — no fragment reference or queryRef is passed in — but it runs a Relay `domains` query with `store-and-network`, so it must render under a RelayEnvironmentProvider and inside a Suspense boundary. The whole domain list arrives in one request; there is no pagination and no server-side search, so the search box of the underlying select filters the loaded options. Both the option label and the option value are the domain name, which makes it the right control wherever the API expects a domain name rather than an id — use BAIDomainSelectV2 when a domain uuid is wanted. It is a thin wrapper over BAISelect: everything except the props below is passed straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it inside a BAIFormItem whose `name` is the domain-name field, and let the form own the value instead of controlling it by hand.',
      },
      {
        guidance: true,
        description:
          'Set `activeOnly={false}` only where inactive domains must be selectable, such as an admin view that edits an existing record pointing at one.',
      },
      {
        guidance: true,
        description:
          'Clear dependent fields — project pickers in particular — from `onChange`, since their options are scoped to the domain.',
      },
      {
        guidance: false,
        description:
          'Look for an `options` prop — the props type omits it, and the list always comes from the domain query.',
      },
    ],
  },
  props: [
    {
      name: 'activeOnly',
      type: 'boolean',
      description:
        'Becomes the `is_active` query argument. Left at the default, only active domains are listed.',
      default: 'true',
    },
    {
      name: 'value',
      type: 'string | null',
      description:
        'Selected domain name. Uncontrolled use through `defaultValue` is supported by useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | null) => void',
      description:
        'Fired with the selected domain name, or null when cleared, forwarded from BAISelect.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Empty-state text on the trigger. Defaults to the translated "Select domain"; passing a value replaces it.',
    },
  ],
  examples: [
    {
      label: 'Domain field that resets the dependent project field',
      code: `<BAIFormItem
  name="domain_name"
  label={t('credential.Domain')}
  rules={[{ required: true }]}
>
  <BAIDomainSelect
    onChange={() => {
      formRef.current?.setFieldValue('group_ids', []);
    }}
  />
</BAIFormItem>`,
    },
    {
      label: 'Plain domain field',
      code: `<BAIFormItem name="domain" label={t('resourceGroup.Domain')}>
  <BAIDomainSelect />
</BAIFormItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
