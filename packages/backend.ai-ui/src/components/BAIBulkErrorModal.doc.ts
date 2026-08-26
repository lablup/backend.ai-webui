import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBulkErrorModal',
  displayName: 'BAI Bulk Error Modal',
  category: 'Overlay',
  keywords: [
    'bulk',
    'partial failure',
    'error modal',
    'error report',
    'failed requests',
    'batch',
    'result dialog',
  ],
  usage: {
    description:
      'The shared report for a bulk operation that partially failed: one row per failed request, in a table the caller describes with its own columns because every bulk endpoint has a different response shape. It builds on BAIModal and fixes the parts that should not vary — a localized "Action execution failed" title with an error icon, a compact bordered BAITable paginated at ten rows (the pager hides on a single page), and an optional BAIAlert above it for retry guidance. The modal is purely informational: it renders no footer, so dismissal happens through the header close button, the backdrop or Escape and is reported through `onRequestClose`, leaving the caller to decide whether its own form stays open for a retry. Everything BAIModalProps declares except `children`, `onOk`, `onCancel`, `footer` and `type` passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the caller form mounted behind the modal and reopen it from `onRequestClose`, so the user can correct the failed rows without re-entering the successful ones.',
      },
      {
        guidance: true,
        description:
          'Give every record a unique `key`, since the table resolves row keys from that field.',
      },
      {
        guidance: true,
        description:
          'Put the success/failure counts and the retry instruction in `alertDescription` — it is the only slot that carries operation-specific copy.',
      },
      {
        guidance: true,
        description:
          'Include the per-row error message as one of the columns; a list of names alone does not tell the user what to fix.',
      },
      {
        guidance: false,
        description:
          'Use it for a wholly failed operation — a single error notification is the right weight when there is nothing partial to report.',
      },
      {
        guidance: false,
        description:
          'Add confirm or retry buttons by passing a footer; the surface is a report, and its dismissal path is the header close button.',
      },
    ],
  },
  props: [
    {
      name: 'columns',
      type: 'BAIColumnsType<RecordType>',
      description:
        'Column definitions for the failed-request table. The caller describes how one failed request renders, since each bulk operation has its own response shape.',
      required: true,
    },
    {
      name: 'dataSource',
      type: 'RecordType[]',
      description:
        'One record per failed request. Each record needs a unique `key` field for row identity.',
      required: true,
    },
    {
      name: 'alertDescription',
      type: 'ReactNode',
      description:
        'Operation-specific guidance rendered as the body of an error BAIAlert above the table, under a fixed localized "Error Occurred" title. Omit it and no alert is rendered.',
    },
    {
      name: 'onRequestClose',
      type: '() => void',
      description:
        'Called when the user dismisses the modal through the header close button, the backdrop or Escape. This is the only exit, so close the modal and decide what follows here.',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Replaces the default icon-plus-"Action execution failed" header verbatim with operation-specific copy.',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        'Modal width, inherited from BAIModal and defaulted here to fit a multi-column failure table.',
      default: '720',
    },
  ],
  examples: [
    {
      label: 'Reporting partially failed bulk user creation',
      code: `<BAIBulkErrorModal<FailedUserCreation>
  open={open}
  alertDescription={
    <>
      {t('credential.BulkCreateUserPartialFailureDescription')}{' '}
      <Text color="secondary" size="sm">
        {t('credential.BulkCreateUserPartialFailure', {
          successCount: createdCount,
          failCount: failedUsers.length,
        })}
      </Text>
    </>
  }
  columns={columns}
  dataSource={failedUsers}
  onRequestClose={() => setFailedUsers([])}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
