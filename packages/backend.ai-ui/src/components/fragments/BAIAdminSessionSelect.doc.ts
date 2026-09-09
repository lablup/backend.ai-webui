import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminSessionSelect',
  displayName: 'BAI Admin Session Select',
  category: 'Data Input',
  keywords: [
    'session',
    'compute session',
    'select',
    'dropdown',
    'picker',
    'admin',
    'relay',
  ],
  usage: {
    description:
      'Picks a compute session from the admin-scoped `adminSessionsV2` connection. It is self-fetching — there is no fragment reference or queryRef to pass — but it issues its own Relay queries, so it must render under a RelayEnvironmentProvider and inside a Suspense boundary. Two queries back it: a paginated list query (10 rows per page, advanced when the popup is scrolled to the bottom) whose `name` filter follows the debounced search text, and a value query that resolves the labels of the currently selected ids so the trigger still reads correctly once the list has paged past them; both exclude TERMINATING, TERMINATED and CANCELLED sessions. The outer value contract is the raw session UUID (`toLocalId`), never the Relay global id, and the labelInValue shape stays internal. Every prop not listed below is passed through to BAIComplexSelect, whose `label` prop is required.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always pass `label`, since BAIComplexSelect requires an accessible name; add `isLabelHidden` when an enclosing BAIFormItem already prints it.',
      },
      {
        guidance: true,
        description:
          'Wrap it in Suspense with a disabled placeholder select as the fallback — both of its queries suspend on first render.',
      },
      {
        guidance: true,
        description:
          'Store the emitted plain UUID and hand the same string back as `value`; the component resolves the label itself.',
      },
      {
        guidance: false,
        description:
          'Expect the option list to pick up a session created elsewhere while the popup is closed — the list query stays `store-only` until the popup opens, so call `refetch()` on the ref to force a reload.',
      },
      {
        guidance: false,
        description:
          'Pass a Relay global id as `value`; the keys are raw UUIDs, and a global id resolves to no label and echoes itself in the trigger.',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected session id(s) as raw UUIDs. An array when `multiple` is set, a single string otherwise. Uncontrolled use through `defaultValue` is supported by useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new selection — an array of UUIDs in multiple mode, one UUID otherwise. It receives the value only; no matching option object is passed.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      description:
        'Switches the control to multi-select, which also switches `value` and `onChange` to their array form.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Forces the trigger spinner on. The component ORs it with its own pending states (a deferred selection, an unsettled search string, an in-flight `refetch`), so passing `false` does not hide those.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Empty-state text on the trigger. Defaults to the translated "Select session"; passing a value replaces it.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open/close. The component also consumes it internally to flip the list query between `network-only` while open and `store-only` while closed, so a caller-supplied handler observes the same edges rather than replacing that behaviour.',
    },
    {
      name: 'ref',
      type: 'React.Ref<BAIAdminSessionSelectRef>',
      description:
        'Exposes `refetch()`, which bumps the fetch key inside a transition and reloads both the list query and the value query.',
    },
  ],
  examples: [
    {
      label: 'Scope-id picker inside a form item',
      code: `<Suspense fallback={fallback}>
  <BAIAdminSessionSelect
    label={t('rbac.ScopeId')}
    isLabelHidden
    value={scopeId}
    onChange={(value) => setScopeId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
