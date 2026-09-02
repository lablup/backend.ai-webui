import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIStorageProxySelect',
  displayName: 'BAI Storage Proxy Select',
  category: 'Data Input',
  keywords: [
    'storage proxy',
    'sftp proxy',
    'volume',
    'select',
    'dropdown',
    'combobox',
    'relay',
  ],
  usage: {
    description:
      'The storage-proxy picker used by the resource-group settings forms. There is no dedicated proxy-list field on the API yet, so BAIStorageProxySelectQuery fetches one fixed page of up to 1000 storage volumes and the component derives the distinct, non-null proxy names from them; each name becomes an option that is both the label and the value. The query is a useLazyLoadQuery call, so the control suspends on first render — put the Suspense boundary around the enclosing form item rather than the select, or the form loses its value/onChange binding. Everything else is BAISelect: mode, allowClear, value, onChange, autoSelectOption, disabled and the rest of BAISelectProps pass straight through, with options removed from the props type because the component always supplies it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap the surrounding BAIFormItem in Suspense, not the select itself, so the form item keeps injecting value and onChange.',
      },
      {
        guidance: true,
        description:
          'Use mode="multiple" for the resource-group fields that store a list of SFTP proxies, so the form value shape matches the backend field.',
      },
      {
        guidance: true,
        description:
          'Pair autoSelectOption with a real value/onChange pair — it only calls onChange and does not hold the selection itself.',
      },
      {
        guidance: false,
        description:
          'Expect a proxy that currently backs no volume to appear; the option list is derived from the volume list, so such a proxy is invisible here.',
      },
      {
        guidance: false,
        description:
          'Reach for it where the proxy names come from somewhere other than the volume list — use BAISelect with your own options there.',
      },
    ],
  },
  props: [
    {
      name: 'showSearch',
      type: 'boolean',
      description:
        'Whether the in-popup search box is shown. Enabled by the component and applied before the prop spread, so a call site can turn it off.',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'ReactNode',
      description:
        'Trigger text while nothing is selected. Applied before the prop spread, so a call site can override the translated default.',
      default: "t('comp:BAIStorageProxySelect.SelectStorageProxy')",
    },
  ],
  examples: [
    {
      label: 'SFTP proxies field in a resource group form',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIFormItem
    name="proxies"
    label={t('storageProxy.SFTPStorageProxies')}
    tooltip={t('storageProxy.SFTPStorageProxiesDescription')}
  >
    <BAIStorageProxySelect mode="multiple" allowClear />
  </BAIFormItem>
</Suspense>`,
    },
    {
      label: 'Single proxy, auto-selected once the options load',
      code: `<BAIStorageProxySelect
  autoSelectOption
  style={{ width: 300 }}
  value={proxy}
  onChange={setProxy}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
