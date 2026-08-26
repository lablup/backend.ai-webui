import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectBulkEditModal',
  displayName: 'BAI Project Bulk Edit Modal',
  category: 'Overlay',
  keywords: [
    'project',
    'group',
    'bulk edit',
    'batch',
    'resource policy',
    'modal',
  ],
  usage: {
    description:
      'Modal that applies one project resource policy to several projects at once. It reads the plural fragment `BAIProjectBulkEditModalFragment` on `GroupNode` (`name`, `row_id`), so the caller spreads that fragment on the project nodes in its list query and passes the selected array as `selectedProjectFragments`. The body lists the affected project names in an info alert and offers a single field, backed by BAIProjectResourcePolicySelect inside a Suspense boundary. Confirming validates the form and fires one `modify_group` mutation per selected `row_id`, calling `onOk` only after every mutation has settled. Remaining props go to BAIModal, but `title`, `okText` and `confirmLoading` are applied after the spread and cannot be overridden.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIProjectBulkEditModalFragment` on the `GroupNode` in the list query and keep the selected rows in state, passing that array straight to `selectedProjectFragments`.',
      },
      {
        guidance: true,
        description:
          'Refetch the project list and clear the selection in `onOk` — the mutation returns only `ok`, so nothing the table shows is updated on its own.',
      },
      {
        guidance: true,
        description:
          'Keep the selection non-empty while the modal is open; with an empty array the alert lists nothing and confirming issues no mutation at all.',
      },
      {
        guidance: false,
        description:
          'Treat `onOk` as a success signal — it is called once all mutations settle, including when some of them failed.',
      },
      {
        guidance: false,
        description:
          'Reach for it to change anything other than the resource policy; the mutation sends only `resource_policy`, and any other field would be silently dropped.',
      },
    ],
  },
  props: [
    {
      name: 'selectedProjectFragments',
      type: 'BAIProjectBulkEditModalFragment$key',
      description:
        'Plural fragment reference for the projects to update. Their `name` drives the info alert and their `row_id` becomes the `gid` of each mutation; entries without a `row_id` are skipped.',
      required: true,
    },
    {
      name: 'onOk',
      type: '(e: React.MouseEvent<HTMLButtonElement>) => void',
      description:
        'Called after every `modify_group` mutation has settled. Close the modal, clear the selection and refetch here.',
    },
    {
      name: 'title',
      type: 'React.ReactNode',
      description:
        'Accepted and ignored — the modal sets its own translated "update multiple projects" title after spreading the rest of the props.',
    },
    {
      name: 'okText',
      type: 'React.ReactNode',
      description:
        'Accepted and ignored — the confirm button is always labelled with the shared "Save" string.',
    },
    {
      name: 'confirmLoading',
      type: 'boolean',
      description:
        'Accepted and ignored — the confirm button’s pending state is driven by the modal’s own saving flag, which stays on until all mutations settle.',
    },
  ],
  examples: [
    {
      label: 'Bulk edit from a project table selection',
      code: `<BAIProjectBulkEditModal
  open={openBulkEditModal}
  selectedProjectFragments={selectedProjectList}
  onOk={() => {
    updateFetchKey();
    toggleBulkEditModal();
    setSelectedProjectList([]);
  }}
  onCancel={() => toggleBulkEditModal()}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
