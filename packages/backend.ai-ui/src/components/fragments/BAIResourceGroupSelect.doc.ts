import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIResourceGroupSelect',
  displayName: 'BAI Resource Group Select',
  category: 'Data Input',
  keywords: [
    'resource group',
    'scaling group',
    'cluster',
    'select',
    'dropdown',
    'picker',
  ],
  usage: {
    description:
      'Picks a resource group by name. Unlike the paginated Relay selects, it takes no fragment reference and no query reference: it runs one unpaged `scaling_groups` query itself, de-duplicates the results by name, and uses that name as both the option label and the option value — so the caller only has to mount it inside a Suspense boundary and bind `value` / `onChange`. It renders BAISelect, and because the whole list is local, filtering happens client-side in the popup. Only the two props below are set by this component; everything else, including `value`, `onChange`, `allowClear` and `disabled`, passes straight through to BAISelect.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount it under a Suspense boundary — it calls useLazyLoadQuery itself and suspends on first load; a BAISelect with `loading` and `disabled` makes a good fallback because it keeps the field in place.',
      },
      {
        guidance: true,
        description:
          'Keep the field spreadable when wrapping it for Suspense inside a BAIFormItem, so the `value` / `onChange` pair the form item injects reaches the select rather than the boundary.',
      },
      {
        guidance: true,
        description:
          'Add `allowClear` where an empty resource group is meaningful, such as a preset that applies to every group.',
      },
      {
        guidance: false,
        description:
          'Expect an id in `onChange` — the value is the resource group name, which is also what the REST and GraphQL payloads take.',
      },
      {
        guidance: false,
        description:
          'Mount several of them on one page to show the same list; they each issue the query, so lift the selection into one field instead.',
      },
    ],
  },
  props: [
    {
      name: 'placeholder',
      type: 'ReactNode',
      description:
        'Empty-state text on the trigger. Defaults to the translated "Select resource group", and is applied before your props are spread, so passing one replaces it.',
    },
    {
      name: 'showSearch',
      type: 'boolean | { searchValue?: string; onSearch?: (value: string) => void }',
      description:
        'Enables the in-popup search box, which filters the already-loaded names client-side. Enabled by default here; pass `false` to turn it off.',
      default: 'true',
    },
  ],
  examples: [
    {
      label: 'Optional resource group in a form',
      code: `<BAIFormItem label={t('general.ResourceGroup')} name="scaling_group_name">
  <Suspense fallback={<BAISelect loading disabled />}>
    <BAIResourceGroupSelect allowClear />
  </Suspense>
</BAIFormItem>`,
    },
    {
      label: 'Controlled selection',
      code: `<BAIResourceGroupSelect
  value={resourceGroup}
  onChange={(value) => setResourceGroup(value)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
