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
    'multi select',
    'dropdown',
    'combobox',
    'relay',
  ],
  usage: {
    description:
      'The storage-proxy multi-select used by the resource-group settings forms: a BAIMultiSelector whose value is a list of proxy names (`string[]`). There is no dedicated proxy-list field on the API yet, so BAIStorageProxySelectQuery fetches one fixed page of up to 1000 storage volumes and the component derives the distinct, non-null proxy names from them; each name becomes an option that is both the label and the value. The query is a useLazyLoadQuery call, so the control suspends on first render — put the Suspense boundary around the enclosing form item rather than the select, or the form loses its value/onChange binding. Everything else is BAIMultiSelector: hasClear, value, onChange, disabled and the rest of BAIMultiSelectorProps pass straight through, with options removed from the props type because the component always supplies it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap the surrounding BAIFormItem in Suspense, not the select itself, so the form item keeps injecting value and onChange.',
      },
      {
        guidance: true,
        description:
          'Bind it to the resource-group fields that store a list of SFTP proxies — the value is always `string[]`, the shape the backend field takes.',
      },
      {
        guidance: false,
        description:
          'Expect a proxy that currently backs no volume to appear; the option list is derived from the volume list, so such a proxy is invisible here.',
      },
      {
        guidance: false,
        description:
          'Reach for it where the proxy names come from somewhere other than the volume list — use BAIMultiSelector with your own options there.',
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
    {
      name: 'placeholder',
      type: 'string',
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
    <BAIStorageProxySelect hasClear />
  </BAIFormItem>
</Suspense>`,
    },
    {
      label: 'Standalone, controlled list of proxies',
      code: `<BAIStorageProxySelect
  width={300}
  value={proxies}
  onChange={setProxies}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
