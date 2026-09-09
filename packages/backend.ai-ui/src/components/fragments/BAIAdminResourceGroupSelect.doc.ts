import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminResourceGroupSelect',
  displayName: 'BAI Admin Resource Group Select',
  category: 'Data Input',
  keywords: [
    'resource group',
    'scaling group',
    'select',
    'dropdown',
    'picker',
    'admin',
    'relay fragment',
  ],
  usage: {
    description:
      'Admin-scoped picker for a resource group (scaling group), built on BAIComplexSelect. It is the fragment-driven member of this family: instead of running its own query it reads `BAIAdminResourceGroupSelect_resourceGroupsFragment` on Query through `usePaginationFragment`, so the parent must spread that fragment into its own `useLazyLoadQuery` and hand the result down as `queryRef`. Pagination is cursor-based — 10 nodes per page, `loadNext(10)` fired when the popup scrolls to the bottom and `hasNext` is true — and typing in the search box calls the fragment `refetch` with a `name contains` filter, so search restarts the connection rather than filtering locally. A resource group is keyed by its `name`, which is also its label, so there is no separate label-resolution query and the trigger is correct for any value. The emitted value is that name (`string`, or `string[]` in `multiple` mode). `label` is required by BAIComplexSelect, and every prop not listed below is forwarded to it — except `options`, `value`, `onChange`, `searchValue`, `onSearch` and `total`, which this wrapper owns and omits from its props type.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wrap it in a small orchestrator component that runs `useLazyLoadQuery` with `...BAIAdminResourceGroupSelect_resourceGroupsFragment` spread into the query, and pass that query result as `queryRef`.',
      },
      {
        guidance: true,
        description:
          'Give it a `label` even where a Form.Item already prints one, and add `isLabelHidden` — the Astryx field takes its accessible name from that prop.',
      },
      {
        guidance: true,
        description:
          'Spread the exact fragment key this component declares; a structurally identical fragment from another component type-checks but resolves no data at runtime.',
      },
      {
        guidance: false,
        description:
          'Reach for it on non-admin surfaces where only the groups a project may use should be listed — BAIProjectResourceGroupSelect is the permission-scoped picker.',
      },
      {
        guidance: false,
        description:
          'Expect `isLoading` to cover paging or search: it is forwarded as given, while the next-page spinner comes from the fragment hook and search reloads the connection through `refetch`.',
      },
    ],
  },
  props: [
    {
      name: 'queryRef',
      type: 'BAIAdminResourceGroupSelect_resourceGroupsFragment$key',
      description:
        'Fragment key for `BAIAdminResourceGroupSelect_resourceGroupsFragment` on Query, which the parent query must spread. It supplies the whole option list; without it the component has no data to render.',
      required: true,
    },
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Controlled selection as the resource group name, or an array of names in `multiple` mode. The name is also the label, so a value outside the loaded pages still displays correctly.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the chosen resource group name, or the array of names in `multiple` mode. It passes no second option argument.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches to multi-selection: `value` and the `onChange` payload become arrays, and the trigger lists the selected names.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Pending state on the trigger, forwarded as given — this wrapper adds no internal loading state of its own to it.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Trigger text while nothing is selected. Defaults to the BUI-localized resource group placeholder; a value passed here replaces it.',
    },
  ],
  examples: [
    {
      label: 'Orchestrator query plus the field',
      code: `const ResourceGroupScopeIdSelect: React.FC<Props> = (props) => {
  const queryRef = useLazyLoadQuery<RoleFormModalResourceGroupQuery>(
    graphql\`
      query RoleFormModalResourceGroupQuery {
        ...BAIAdminResourceGroupSelect_resourceGroupsFragment
      }
    \`,
    {},
    { fetchPolicy: 'store-and-network' },
  );
  return <BAIAdminResourceGroupSelect queryRef={queryRef} {...props} />;
};`,
    },
    {
      label: 'Inside a form item',
      code: `<BAIFormItem name="scaling_group" label={t('agent.ResourceGroup')} required>
  <BAIAdminResourceGroupSelect
    label={t('agent.ResourceGroup')}
    isLabelHidden
    queryRef={queryRef}
  />
</BAIFormItem>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
