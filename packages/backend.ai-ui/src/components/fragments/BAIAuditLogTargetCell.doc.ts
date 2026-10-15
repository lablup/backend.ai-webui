import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAuditLogTargetCell',
  displayName: 'BAI Audit Log Target Cell',
  category: 'Table & List',
  keywords: [
    'audit',
    'log',
    'target',
    'entity',
    'scope',
    'action kind',
    'bulk',
    'lookup',
  ],
  usage: {
    description:
      'The Target cell of the audit log table. It reads `BAIAuditLogTargetCellFragment` on `AuditLogV2` and draws the record\'s target according to its `actionKind`: `SINGLE_ENTITY` shows the entity; `BULK` shows the entity, the copyable run id (`actionId`) and, when `runCount` is above one, an "N in this run" badge; `SCOPE` shows the affected entity, or "No affected entity" when there is none, with its scopes; `RELATION` shows the two scopes joined by an arrow; `MEMBERSHIP` shows the entity and the scope it joined or left; `GLOBAL` shows a "Global" token; `LOOKUP` shows `lookupKind: lookupKey` and the entity it resolved to, or "Not found" on a miss. A record without an action kind (written before the manager recorded one) shows its raw entity type and id. An entity is labelled with its type as a Token and its name when the manager still resolves it, otherwise its id. Up to three scopes are fetched; the rest are counted in a `+N` badge. The cell links nowhere, since BUI cannot reach the host router.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Compute `runCount` from the rows on the current page grouped by `actionId`, as BAIAuditLogNodes does — the manager has no filter by run, so the count is what the page shows.',
      },
      {
        guidance: false,
        description:
          'Read `runCount` as the size of the whole run; rows of the same run on other pages are not counted.',
      },
    ],
  },
  props: [
    {
      name: 'auditLogFrgmt',
      type: 'BAIAuditLogTargetCellFragment$key',
      description:
        'Fragment reference on `AuditLogV2` — the record whose target is drawn.',
      required: true,
    },
    {
      name: 'runCount',
      type: 'number',
      description:
        "How many rows on the current page share this record's `actionId`. Only a `BULK` record uses it, and only a value above one shows the badge. Defaults to 1.",
    },
  ],
  examples: [
    {
      label: 'As a table column',
      code: `const runCounts = _.countBy(auditLogs, 'actionId');

{
  key: 'target',
  title: t('comp:BAIAuditLogNodes.Target'),
  render: (__, record) => (
    <BAIAuditLogTargetCell
      auditLogFrgmt={record}
      runCount={runCounts[record.actionId]}
    />
  ),
}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
