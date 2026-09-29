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
    'admin',
  ],
  usage: {
    description:
      'Picks a resource group by name at admin scope. Unlike the paginated Relay selects, it takes no fragment reference and no query reference: it runs one `adminResourceGroups` query itself (manager 26.2.0+, admin only, ordered by name, capped at 100 groups), and uses the name as both the option label and the option value — so the caller only has to mount it inside a Suspense boundary and bind `value` / `onChange`. The optional `filter` narrows the list (`isActive`, `isPublic`); without it every resource group is listed, inactive ones included. The same query is exposed as the `useResourceGroupNames(filter)` hook: a parent that needs the names during render — to pick a default before its own query runs — calls the hook with the same `filter` it passes to the select, and Relay serves both from one request. It renders BAISelect, and because the whole list is local, filtering happens client-side in the popup. Only the props below are set by this component; everything else, including `value`, `onChange`, `allowClear` and `disabled`, passes straight through to BAISelect.',
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
          'Pass `filter={{ isActive: true }}` where an inactive group is not a meaningful choice (scheduling scopes, pending queues); leave it off where binding to an inactive group is legitimate, such as a resource preset.',
      },
      {
        guidance: true,
        description:
          'When the parent must know the list before render, call `useResourceGroupNames` with the exact `filter` object shape the select receives — a different shape is a different Relay request.',
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
          'Reach for it on non-admin surfaces where only the groups a project may use should be listed — BAIProjectResourceGroupSelect is the permission-scoped picker.',
      },
    ],
  },
  props: [
    {
      name: 'filter',
      type: '{ isActive?: boolean | null; isPublic?: boolean | null } | null',
      description:
        'Server-side narrowing of the admin-scope list, forwarded as the `adminResourceGroups` filter. Omit to list every resource group.',
    },
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
      label: 'Active groups only, default resolved before render',
      code: `const resourceGroupNames = useResourceGroupNames({ isActive: true });
const currentResourceGroup = _.includes(resourceGroupNames, fromUrl)
  ? fromUrl
  : _.first(resourceGroupNames);

<BAIResourceGroupSelect
  filter={{ isActive: true }}
  value={currentResourceGroup}
  onChange={(value) => setFromUrl(value ?? null)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
