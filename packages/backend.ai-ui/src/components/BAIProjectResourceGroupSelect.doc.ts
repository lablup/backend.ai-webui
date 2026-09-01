import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectResourceGroupSelect',
  displayName: 'BAI Project Resource Group Select',
  category: 'Data Input',
  keywords: [
    'resource group',
    'scaling group',
    'select',
    'dropdown',
    'project',
    'picker',
  ],
  usage: {
    description:
      'The picker for the resource group (scaling group) a session, deployment or folder operation should run in. It renders BAISelect and owns the option list itself: `useProjectResourceGroups(projectName)` fetches the groups the given project is allowed to use, and each one becomes a `{ value, label }` option whose row is rendered through BAITextHighlighter so the in-popup search term is highlighted. It also keeps the selection honest — once a NON-EMPTY list has loaded, a value absent from it is reset to undefined; an empty list is read as "not fetched yet" and leaves a pre-filled value alone, so a project with no allowed groups keeps showing one. Every change is committed inside a transition, with the control disabled and an optimistic value shown while that transition is pending. It suspends while the groups load, so wrap it in a Suspense boundary. Everything not listed below is forwarded to BAISelect.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it inside a Suspense boundary with a BAISkeleton fallback — the underlying query suspends on first load and whenever `projectName` changes.',
      },
      {
        guidance: true,
        description:
          'Remount it with a `key` derived from the project id when the project can change, so the previous project’s selection cannot survive the switch.',
      },
      {
        guidance: true,
        description:
          'Reach for `autoSelectDefault` only where a silent choice is acceptable — it picks the group named "default", or the first available one, and reports it through onChange.',
      },
      {
        guidance: true,
        description:
          'Narrow the list with `filter` when a surface only accepts certain groups, instead of post-filtering the selection after the user has picked.',
      },
      {
        guidance: false,
        description:
          'Pass `options` — the component derives them from the project’s allowed resource groups, and supplying your own defeats the permission scoping.',
      },
      {
        guidance: false,
        description:
          'Assume a pre-filled value is always validated: it is cleared only once a non-empty group list has arrived, so it survives both loading and an empty allowed-group list.',
      },
    ],
  },
  props: [
    {
      name: 'projectName',
      type: 'string',
      description:
        'Project whose allowed resource groups are listed. Changing it refetches the list and can clear a now-invalid selection.',
      required: true,
    },
    {
      name: 'autoSelectDefault',
      type: 'boolean',
      description:
        'Selects a group once, as soon as options first appear — the one named "default", otherwise the first — and fires onChange with it. It reacts to that initial transition only, not to later selection changes.',
    },
    {
      name: 'filter',
      type: '(resourceGroupName: string) => boolean',
      description:
        'Narrows the fetched groups by name before they become options. Applied inside the fetch hook, so a filtered-out group is never selectable.',
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Controlled selection. While a change transition is pending the optimistic value is displayed instead, so the trigger updates immediately.',
    },
    {
      name: 'onChange',
      type: '(value: any, option?: any) => void',
      description:
        'Fired with the chosen group name, and also when auto-select resolves a value or an invalid value is reset to undefined.',
    },
    {
      name: 'showSearch',
      type: 'boolean | { searchValue?: string; onSearch?: (value: string) => void }',
      description:
        'Enables the in-popup search box. The component keeps the search term controllable so BAITextHighlighter can highlight the match in every option row.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'External pending state. It is combined with the internal change transition — the trigger reads as pending while either is true.',
    },
    {
      name: 'options',
      type: 'Array<{ value: string; label: string }>',
      description:
        'Owned by the component and built from the project’s resource groups. Listed only because it is part of the inherited BAISelect surface; overriding it bypasses the permission-scoped list.',
    },
  ],
  examples: [
    {
      label: 'Project-scoped picker with an explicit choice',
      code: `<Suspense fallback={<BAISkeleton variant="input" />}>
  <BAIProjectResourceGroupSelect
    key={chosenProject?.id ?? 'no-project'}
    projectName={chosenProject?.name ?? ''}
    disabled={!chosenProject}
    value={chosenResourceGroup}
    onChange={(value) => setChosenResourceGroup(value)}
    style={{ width: '100%' }}
  />
</Suspense>`,
    },
    {
      label: 'Required form field that auto-selects the default group',
      code: `<Form.Item
  name="resourceGroup"
  label={t('modelStore.ResourceGroup')}
  rules={[{ required: true }]}
>
  <BAIProjectResourceGroupSelect
    projectName={project.name}
    autoSelectDefault
    style={{ width: '100%' }}
  />
</Form.Item>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
