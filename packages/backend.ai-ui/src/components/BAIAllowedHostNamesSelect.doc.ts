import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAllowedHostNamesSelect',
  displayName: 'BAI Allowed Host Names Select',
  category: 'Data Input',
  keywords: [
    'allowed hosts',
    'vfolder host',
    'storage host',
    'host select',
    'dropdown',
    'combobox',
  ],
  usage: {
    description:
      'A BAISelect pre-filled with the storage hosts the current user is allowed to use. It calls useAllowedHostNames, which reads the vfolder host list through the Backend.AI client with TanStack Query, and maps each host name into an option whose value and label are the name itself. That hook suspends while the list loads, so the control needs a Suspense boundary above it. Everything else is BAISelect: mode, allowClear, showSearch, placeholder, value, onChange and the rest of BAISelectProps pass straight through, and the component adds no state of its own.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it under a Suspense boundary — the host list is fetched with a suspending query and the control cannot render before it resolves.',
      },
      {
        guidance: true,
        description:
          'Use mode="multiple" for the resource-policy fields that store a list of allowed hosts, so the form value shape matches the backend field.',
      },
      {
        guidance: true,
        description:
          'Let a BAIFormItem own the value and onChange rather than mirroring the selection into local state.',
      },
      {
        guidance: false,
        description:
          'Supply your own options — they are overwritten by the fetched host list on every render.',
      },
      {
        guidance: false,
        description:
          'Reach for it where the hosts come from somewhere other than the vfolder host API; use BAISelect directly there.',
      },
    ],
  },
  props: [
    {
      name: 'options',
      type: 'Array<{ value: string; label: string }>',
      description:
        'Accepted from BAISelectProps and ignored — the component always replaces it with one option per allowed host name, value and label both set to the host name.',
    },
  ],
  examples: [
    {
      label: 'Allowed hosts field in a resource policy form',
      code: `<BAIFormItem
  label={t('resourcePolicy.AllowedHosts')}
  name="allowed_vfolder_hosts"
>
  <BAIAllowedHostNamesSelect mode="multiple" />
</BAIFormItem>`,
    },
    {
      label: 'Single host with search',
      code: `<BAIAllowedHostNamesSelect
  showSearch
  allowClear
  style={{ width: 300 }}
  placeholder={t('data.SelectHost')}
  value={host}
  onChange={setHost}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
