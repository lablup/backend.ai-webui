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
      'Modal that applies one project resource policy to several projects at once. It reads the plural fragment `BAIProjectBulkEditModalFragment` on `GroupNode` (`id`, `name`, `row_id`), so the caller spreads that fragment on the project nodes in its list query and passes the selected array as `selectedProjectFragments`. The body lists the affected project names in an info alert and offers a single field, backed by BAIProjectResourcePolicySelect inside a Suspense boundary. Confirming validates the form and sends one `partialBulkUpdateProjectsV2` mutation with an item per selected `row_id`, then reports the outcome through `onCompleted` as `{ succeededIds, failures }`, keyed by `GroupNode` id; a rejected request reports every project as failed with the request error. The modal shows no result message itself: the caller follows the bulk-mutation rule (success message, or a count error plus `BAIBulkErrorModal` with the failed projects kept selected). Remaining props go to BAIModal except `onOk`, which the modal owns; `title`, `okText` and `confirmLoading` are applied after the spread and cannot be overridden.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `...BAIProjectBulkEditModalFragment` on the `GroupNode` in the list query and keep the selected rows in state, passing that array straight to `selectedProjectFragments`.',
      },
      {
        guidance: true,
        description:
          'In `onCompleted`, refetch the project list when `succeededIds` is non-empty — the mutation returns `ProjectV2` records, so the `GroupNode` rows the table shows are not updated on their own.',
      },
      {
        guidance: true,
        description:
          'When `failures` is non-empty, keep only those projects selected for a retry, show one error message with the count and list `name` and `message` of each in `BAIBulkErrorModal`.',
      },
      {
        guidance: true,
        description:
          'Keep the selection non-empty while the modal is open; with an empty array the alert lists nothing and confirming issues no mutation at all.',
      },
      {
        guidance: false,
        description:
          'Wait for `failures` to be empty before refetching: the projects in `succeededIds` were already updated even when others failed.',
      },
      {
        guidance: false,
        description:
          'Reach for it to change anything other than the resource policy; the mutation sends only `resourcePolicy`, and any other field would be silently dropped.',
      },
    ],
  },
  props: [
    {
      name: 'selectedProjectFragments',
      type: 'BAIProjectBulkEditModalFragment$key',
      description:
        'Plural fragment reference for the projects to update. Their `name` drives the info alert and their `row_id` becomes the `id` of each mutation item; entries without a `row_id` are skipped.',
      required: true,
    },
    {
      name: 'onCompleted',
      type: '(result: BAIProjectBulkEditResult) => void',
      description:
        'Called once the mutation settles, with `succeededIds` (the `GroupNode` ids updated) and `failures` (`{ id, name, message }` per project not updated). A rejected request lists every selected project in `failures`. Not called when form validation fails. Close the modal here.',
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
  onCompleted={({ succeededIds, failures }) => {
    toggleBulkEditModal();
    if (succeededIds.length > 0) updateFetchKey();
    if (failures.length === 0) {
      message.success(t('notification.SuccessfullyUpdated'));
      setSelectedProjectList([]);
      return;
    }
    const failedIds = failures.map((failure) => failure.id);
    setSelectedProjectList((prev) =>
      prev.filter((project) => failedIds.includes(project.id)),
    );
    message.error(
      t('project.BulkUpdatePartialFailure', { count: failures.length }),
    );
    setBulkEditFailures(failures); // listed in BAIBulkErrorModal
  }}
  onCancel={() => toggleBulkEditModal()}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
