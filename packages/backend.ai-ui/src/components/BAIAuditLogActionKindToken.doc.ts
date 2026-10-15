import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAuditLogActionKindToken',
  displayName: 'BAI Audit Log Action Kind Token',
  category: 'Feedback & Status',
  keywords: [
    'audit log',
    'action kind',
    'token',
    'chip',
    'bulk',
    'scope',
    'relation',
    'membership',
    'lookup',
  ],
  usage: {
    description:
      "Labels the shape of the action that wrote an audit log record — the manager's `AuditLogActionKind` (`SINGLE_ENTITY`, `BULK`, `SCOPE`, `RELATION`, `MEMBERSHIP`, `GLOBAL`, `LOOKUP`). A recorded kind is a classification, so it renders as a neutral Astryx Token rather than a Badge. The label is translated; a value outside the seven known kinds is shown verbatim. The same file exports `useAuditLogActionKindOptions()`, which returns the seven `{ value, label }` pairs, so a filter offering the kinds shows exactly the labels the column does. Presentational only, with no Relay dependency; every Token prop except `label` passes through.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Build an action kind filter from `useAuditLogActionKindOptions()` so the filter and the column never disagree on a label.',
      },
      {
        guidance: true,
        description:
          'Render `-` instead of the token when the record has no action kind — records written before the manager recorded it carry `null`.',
      },
      {
        guidance: false,
        description:
          'Color the token per kind; the kind is a classification, and a hue would suggest a state the record does not have.',
      },
    ],
  },
  props: [
    {
      name: 'actionKind',
      type: 'string',
      description:
        'The `AuditLogActionKind` value to label. A known kind is shown with its translated label; any other string is shown as given.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'In an audit log table column',
      code: `{
  key: 'actionKind',
  title: t('comp:BAIAuditLogNodes.ActionKind'),
  render: (__, record) =>
    record.actionKind ? (
      <BAIAuditLogActionKindToken actionKind={record.actionKind} />
    ) : (
      '-'
    ),
}`,
    },
    {
      label: 'Filter options',
      code: `const actionKindOptions = useAuditLogActionKindOptions();`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
