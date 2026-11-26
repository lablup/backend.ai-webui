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
    'multi select',
    'dropdown',
    'combobox',
  ],
  usage: {
    description:
      'A BAIMultiSelector pre-filled with the storage hosts the current user is allowed to use, so its value is a list of host names (`string[]`). It calls useAllowedHostNames, which reads the vfolder host list through the Backend.AI client with TanStack Query, and maps each host name into an option whose value and label are the name itself. That hook suspends while the list loads, so the control needs a Suspense boundary above it. It turns search on; everything else is BAIMultiSelector: hasClear, placeholder, value, onChange and the rest of BAIMultiSelectorProps except options pass straight through, and the component adds no state of its own.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it under a Suspense boundary — the host list is fetched with a suspending query and the control cannot render before it resolves.',
      },
      {
        guidance: true,
        description:
          'Bind it to the resource-policy fields that store a list of allowed hosts — the value is always `string[]`, the shape the backend field takes.',
      },
      {
        guidance: true,
        description:
          'Let a BAIFormItem own the value and onChange rather than mirroring the selection into local state.',
      },
      {
        guidance: false,
        description:
          'Look for an `options` prop — the props type omits it, and the list always comes from the vfolder host API.',
      },
      {
        guidance: false,
        description:
          'Reach for it where the hosts come from somewhere other than the vfolder host API; use BAIMultiSelector directly there.',
      },
    ],
  },
  props: [
    {
      name: 'hasSearch',
      type: 'boolean',
      description:
        'The search field in the listbox. Set by the component before the prop spread, so a call site can turn it off.',
      default: 'true',
    },
  ],
  examples: [
    {
      label: 'Allowed hosts field in a resource policy form',
      code: `<BAIFormItem
  label={t('resourcePolicy.AllowedHosts')}
  name="allowed_vfolder_hosts"
>
  <BAIAllowedHostNamesSelect />
</BAIFormItem>`,
    },
    {
      label: 'Standalone, with a clear button',
      code: `<BAIAllowedHostNamesSelect
  hasClear
  width={300}
  placeholder={t('data.SelectHost')}
  value={hosts}
  onChange={setHosts}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
