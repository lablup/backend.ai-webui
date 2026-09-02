import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBucketSelect',
  displayName: 'BAI Bucket Select',
  category: 'Data Input',
  keywords: [
    'bucket',
    'namespace',
    'object storage',
    'select',
    'dropdown',
    'picker',
    'relay',
  ],
  usage: {
    description:
      'Picks a bucket (an object-storage namespace) from the `namespaces` connection of one object storage. It is self-fetching — no fragment reference or queryRef is passed in — but it issues its own Relay query, so it must render under a RelayEnvironmentProvider and inside a Suspense boundary; `objectStorageId` is required and identifies the storage whose namespaces are listed. The list is paginated and extended as the popup is scrolled to the bottom. Unlike the other paginated selects here, `ObjectStorage.namespaces` accepts no filter argument, so there is no out-of-band label lookup: search narrows nothing on the server, and a selected id whose page has not been loaded shows its own raw id as the trigger label. The value is the Relay node id of the namespace, not a converted local id. Every prop not listed below is passed through to BAIComplexSelect, whose `label` prop is required.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it only once an object storage has been chosen, and remount or clear the value when `objectStorageId` changes — a bucket id from another storage will not resolve.',
      },
      {
        guidance: true,
        description:
          'Reload the list after creating a bucket by threading a new `fetchKey` string, since this component exposes no imperative refetch handle.',
      },
      {
        guidance: true,
        description:
          'Keep the popup list short enough to reach the selected bucket by scrolling, because the trigger label of an unloaded selection falls back to the raw id.',
      },
      {
        guidance: false,
        description:
          'Expect typing in the search box to query the server; there is no filter argument on this connection, so it only affects the loading indicator.',
      },
      {
        guidance: false,
        description:
          'Convert the emitted value with `toLocalId` before storing it — the key is already the id the option list and the trigger match on.',
      },
    ],
  },
  props: [
    {
      name: 'objectStorageId',
      type: 'string',
      description:
        'Relay id of the object storage whose namespaces are listed. Required; it is the `objectStorage(id:)` argument of the query.',
      required: true,
    },
    {
      name: 'fetchKey',
      type: 'string',
      description:
        'Relay fetch key for the list query. Change it to force a reload — this is the only refresh path, as no ref handle is exposed.',
    },
    {
      name: 'value',
      type: 'string | Array<string> | null',
      description:
        'Selected namespace id(s). An array when `multiple` is set, a single string otherwise. Labels resolve only for ids present in the already-loaded pages; anything else echoes the id.',
    },
    {
      name: 'onChange',
      type: '(value: string | Array<string> | undefined) => void',
      description:
        'Fired with the new selection — an array of ids in multiple mode, one id otherwise. No matching option object is passed.',
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
        'Forces the trigger spinner on. It is ORed with the component’s own pending states (a deferred selection, an unsettled search string), so passing `false` does not hide those.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Reports popup open/close. The component also consumes it to flip the query between `network-only` while open and `store-only` while closed.',
    },
  ],
  examples: [
    {
      label: 'Bucket picker for a selected object storage',
      code: `<Suspense fallback={fallback}>
  <BAIBucketSelect
    label={t('data.Bucket')}
    objectStorageId={objectStorageId}
    fetchKey={fetchKey}
    value={bucketId}
    onChange={(value) => setBucketId(value as string | undefined)}
  />
</Suspense>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
