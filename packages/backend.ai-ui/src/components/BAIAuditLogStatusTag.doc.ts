import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAuditLogStatusTag',
  displayName: 'BAI Audit Log Status Tag',
  category: 'Feedback & Status',
  keywords: [
    'audit log',
    'status',
    'badge',
    'tag',
    'chip',
    'state indicator',
    'success error',
  ],
  usage: {
    description:
      "The status cell of an audit log table. It wraps BAIBadge and adds the one thing that component does not know: the mapping from the backend's `AuditLogStatus` enum to a semantic color — `SUCCESS` to success, `ERROR` to error, `RUNNING` to info plus the processing ripple, and `UNKNOWN` (or `null`) to an outline-only dot for an indeterminate state. The status string itself is the visible label, and the badge never wraps onto a second line. Presentational only, with no Relay dependency; every other prop passes through to BAIBadge, whose `text`, `color` and `processing` this component owns and therefore does not accept.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Render it from a table column that maps a raw backend status string through a narrowing helper, so an unrecognised value arrives as `UNKNOWN` rather than an untyped string.',
      },
      {
        guidance: true,
        description:
          'Pass `null` for a record whose status is missing — it renders the same indeterminate outline dot as `UNKNOWN` instead of an empty cell.',
      },
      {
        guidance: false,
        description:
          'Reach for it outside audit logs; a status whose vocabulary is not the `AuditLogStatus` enum belongs on BAIBadge with an explicit `color`, or on a purpose-built badge such as BAISchedulingResultBadge.',
      },
      {
        guidance: false,
        description:
          'Override the color by styling the badge — the semantic mapping is the component, and a hand-picked color breaks the shared reading of green/red/blue across audit surfaces.',
      },
    ],
  },
  props: [
    {
      name: 'status',
      type: "'SUCCESS' | 'ERROR' | 'UNKNOWN' | 'RUNNING' | null",
      description:
        'The audit log status to display. It selects the semantic color, decides whether the processing ripple runs (`RUNNING` only), and is rendered verbatim as the badge label. `null` and `UNKNOWN` both produce the outline-only dot.',
      required: true,
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline styles merged onto the badge. `whiteSpace: nowrap` is applied first so the label stays on one line in a narrow table column; passing your own `whiteSpace` overrides it.',
    },
  ],
  examples: [
    {
      label: 'In an audit log table column',
      code: `{
  key: 'status',
  title: t('comp:BAIAuditLogNodes.Status'),
  dataIndex: 'status',
  render: (__, record) => (
    <BAIAuditLogStatusTag status={toAuditLogStatus(record.status)} />
  ),
}`,
    },
    {
      label: 'Standalone',
      code: '<BAIAuditLogStatusTag status="RUNNING" />',
    },
  ],
} satisfies ComponentDoc;

export default docs;
