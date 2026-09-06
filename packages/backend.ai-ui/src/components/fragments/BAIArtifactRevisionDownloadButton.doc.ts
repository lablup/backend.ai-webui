import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactRevisionDownloadButton',
  displayName: 'BAI Artifact Revision Download Button',
  category: 'Action',
  keywords: ['artifact', 'revision', 'download', 'pull', 'import', 'button'],
  usage: {
    description:
      'Icon-only button that starts a pull of one or more artifact revisions. It reads the plural fragment `BAIArtifactRevisionDownloadButtonFragment` on `ArtifactRevision` — only the `status` field — so the caller spreads that fragment on each revision node and passes an ARRAY, even for a single row (`revisionsFrgmt={[record]}`). The button enables itself only when at least one of those revisions has status `SCANNED`; otherwise it renders disabled, in the muted disabled colours instead of the info-tinted enabled ones. It fires nothing on its own: `onClick` is what opens the import modal. `icon` is fixed to the lucide Download glyph and omitted from the props type; every other BAIButton prop — `onClick`, `title`, `size`, `type`, `style` — passes through.',
    bestPractices: [
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
        guidance: true,
        description:
          'Pass the selected revisions directly when the button acts on a multi-row selection; the enable check runs across the whole array.',
      },
      {
        guidance: false,
        description:
          'Rely on `style` to nudge only one colour — the consumer value replaces the computed enabled/disabled colours entirely on this button, unlike BAIArtifactRevisionDeleteButton, which merges them.',
      },
      {
        guidance: false,
        description:
          'Reimplement the "can this be pulled" check at the call site; the component already derives it from the revision statuses.',
      },
    ],
  },
  props: [
    {
      name: 'revisionsFrgmt',
      type: 'BAIArtifactRevisionDownloadButtonFragment$key',
      description:
        'Plural Relay fragment reference — the `ArtifactRevision` nodes this button would pull. The button enables when at least one of them has status `SCANNED`.',
      required: true,
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Marks a pull as in flight. It also forces the button into its disabled state so the same revision cannot be queued twice.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description:
        'Disables the button regardless of revision status — used, for example, while the owning artifact is not `ALIVE`.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style spread after the computed colours, so any `color` or `background` given here overrides the info-tinted enabled and muted disabled treatment.',
    },
    {
      name: 'type',
      type: "'text' | 'default' | 'primary' | 'link' | 'dashed'",
      description:
        'BAIButton emphasis. Defaults to the borderless `text` treatment; call sites that place the button in a toolbar pass `default` to get a bordered control.',
      default: "'text'",
    },
  ],
  examples: [
    {
      label: 'Row action on one revision',
      code: `<BAIArtifactRevisionDownloadButton
  size="small"
  title={t('reservoirPage.PullThisVersion')}
  revisionsFrgmt={[record]}
  loading={status === 'PULLING' || status === 'VERIFYING'}
  onClick={() => setSelectedRevisions([record])}
/>`,
    },
    {
      label: 'Bulk action over the current selection',
      code: `<BAIArtifactRevisionDownloadButton
  type="default"
  title={t('reservoirPage.PullSelectedVersions')}
  revisionsFrgmt={selectedRevisionIdList.flatMap((arr) => arr.data)}
  onClick={() =>
    setSelectedRevisions(selectedRevisionIdList.flatMap((arr) => arr.data))
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
