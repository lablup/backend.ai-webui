import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  name: 'BAIAuditLogActionName',
  displayName: 'BAI Audit Log Action Name',
  category: 'Content',
  keywords: ['audit log', 'action', 'label', 'translation'],
  usage: {
    description:
      "An audit log action's translated label (`comp:BAIAuditLogNodes.ActionName_<actionName>`), the same label the audit log table shows. Use it wherever an action name is shown outside `BAIAuditLogNodes`, so the two never name one action two ways. It falls back to the raw action name, and renders `-` for none.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Render an action name through this component instead of printing `actionName` directly.',
      },
    ],
  },
  components: [
    {
      name: 'BAIAuditLogActionName',
      displayName: 'BAI Audit Log Action Name',
      description: "An audit log action's label.",
      props: [
        {
          name: 'actionName',
          type: 'string | null',
          description:
            'The `actionName` of an audit log entry, such as `create_vfolder`.',
        },
      ],
    },
  ],
  examples: [
    {
      label: 'In a table cell',
      code: `<BAIAuditLogActionName actionName={row.actionName} />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
