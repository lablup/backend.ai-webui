import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactRevisionDeleteButton',
  displayName: 'BAI Artifact Revision Delete Button',
  category: 'Action',
  keywords: ['artifact', 'revision', 'delete', 'remove', 'trash', 'button'],
  usage: {
    description:
      'Icon-only danger button that opens the removal flow for one or more artifact revisions. It reads the plural fragment `BAIArtifactRevisionDeleteButtonFragment` on `ArtifactRevision` — only the `status` field — so the caller spreads that fragment on each revision node and passes an ARRAY, even for a single row (`revisionsFrgmt={[record]}`). It enables only when at least one of those revisions has a status other than `SCANNED` and `PULLING`, since a revision that was never pulled or is still pulling has nothing to remove; otherwise it renders in the muted disabled colours instead of the error-tinted enabled ones. The button performs no mutation and shows no confirmation of its own — `onClick` should open BAIDeleteArtifactRevisionsModal. `icon` is fixed to the lucide Trash2 glyph and omitted from the props type; every other BAIButton prop — `onClick`, `title`, `size`, `type`, `style` — passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Route the click into BAIDeleteArtifactRevisionsModal, so removal keeps the typed-confirmation gate the project requires for irreversible actions.',
      },
      {
        guidance: true,
        description:
          'Wrap a single record in an array so the plural fragment matches what the parent query spread on that node.',
      },
      {
        guidance: true,
        description:
          'Give it a `title`, since the button has no label and `title` supplies both the tooltip and the accessible name.',
      },
      {
        guidance: false,
        description:
          'Hide the button for revisions that cannot be removed; it stays mounted and disables itself, which keeps the row controls aligned across rows.',
      },
      {
        guidance: false,
        description:
          'Restate the error colours through `style` — values given there merge on top of the computed enabled and disabled treatment, so a partial override leaves the rest intact.',
      },
    ],
  },
  props: [
    {
      name: 'revisionsFrgmt',
      type: 'BAIArtifactRevisionDeleteButtonFragment$key',
      description:
        'Plural Relay fragment reference — the `ArtifactRevision` nodes this button would remove. The button enables when at least one of them is neither `SCANNED` nor `PULLING`.',
      required: true,
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Marks the removal as in flight. It also forces the button into its disabled state so the same revisions cannot be submitted twice.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the button regardless of revision status, for callers that gate removal on their own condition such as a missing permission.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style merged over the computed colours; keys left unset keep the error-tinted enabled or muted disabled treatment.',
    },
    {
      name: 'type',
      type: "'text' | 'default' | 'primary' | 'link' | 'dashed'",
      description:
        'BAIButton emphasis. Defaults to the borderless `text` treatment; pass `default` where the button sits in a bordered toolbar.',
      default: "'text'",
    },
  ],
  examples: [
    {
      label: 'Row action on one revision',
      code: `<BAIArtifactRevisionDeleteButton
  size="small"
  title={t('reservoirPage.RemoveThisVersion')}
  revisionsFrgmt={[record]}
  onClick={() => setSelectedDeleteRevisions([record])}
/>`,
    },
    {
      label: 'Bulk action over the current selection',
      code: `<BAIArtifactRevisionDeleteButton
  title={t('reservoirPage.RemoveSelectedVersions')}
  style={{ borderColor: token.colorBorder }}
  revisionsFrgmt={selectedRevisionIdList.flatMap((arr) => arr.data)}
  onClick={() =>
    setSelectedDeleteRevisions(selectedRevisionIdList.flatMap((arr) => arr.data))
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
