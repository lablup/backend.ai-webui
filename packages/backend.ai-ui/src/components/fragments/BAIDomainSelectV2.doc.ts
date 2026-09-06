import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDomainSelectV2',
  displayName: 'BAI Domain Select V2',
  category: 'Data Input',
  keywords: ['domain', 'select', 'dropdown', 'picker', 'uuid', 'relay'],
  usage: {
    description:
      'The uuid-valued sibling of BAIDomainSelect: it shows the domain name but emits the domain uuid. It is self-fetching — no fragment reference or queryRef is passed in — but it runs a Relay `adminDomainsV2` query with `store-and-network`, so it must render under a RelayEnvironmentProvider and inside a Suspense boundary. That field is superadmin-only and requires manager 26.9.0 or later, so gate the component behind the corresponding capability check and fall back to BAIDomainSelect otherwise. The whole list arrives in one request — there is no pagination or server-side search — and each option value is the node id run through `toLocalId`. It is a thin wrapper over BAISelect: everything except the props below is passed straight through, and `options` is not accepted because the component owns them.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Choose between this component and BAIDomainSelect from a manager capability check, since the two emit different value shapes for the same field.',
      },
      {
        guidance: true,
        description:
          'Store the emitted value as a raw uuid; it is already `toLocalId`-converted, so a second conversion is wrong.',
      },
      {
        guidance: true,
        description:
          'Render it under Suspense — the query suspends on first render, and callers typically share one fallback with the alternative select.',
      },
      {
        guidance: false,
        description:
          'Use it on a form field whose API contract is the domain name; that field wants BAIDomainSelect.',
      },
    ],
  },
  props: [
    {
      name: 'activeOnly',
      type: 'boolean',
      description:
        'Becomes the `isActive` filter argument. Left at the default, only active domains are listed; set it to `false` and the filter is sent as null, so every domain is listed.',
      default: 'true',
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Selected domain uuid — the local id, not the Relay global id. Uncontrolled use through `defaultValue` is supported by useControllableValue.',
    },
    {
      name: 'onChange',
      type: '(value: any, option?: any) => void',
      description:
        'Fired with the selected domain uuid and the matching option, forwarded from BAISelect.',
    },
    {
      name: 'placeholder',
      type: 'ReactNode',
      description:
        'Empty-state text on the trigger. Defaults to the same translated "Select domain" string BAIDomainSelect uses; passing a value replaces it.',
    },
  ],
  examples: [
    {
      label: 'Capability-gated domain scope picker',
      code: `<Suspense fallback={fallback}>
  {baiClient.supports('rbac-domain-scope-uuid') ? (
    <BAIDomainSelectV2 {...domainSelectProps} />
  ) : (
    <BAIDomainSelect {...domainSelectProps} />
  )}
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
