import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIArtifactDescriptions',
  displayName: 'BAI Artifact Descriptions',
  category: 'Content',
  keywords: [
    'artifact',
    'descriptions',
    'metadata',
    'summary',
    'details',
    'definition list',
    'reservoir',
  ],
  usage: {
    description:
      'Read-only summary of a single artifact, rendered as an Astryx MetadataList in two-column mode with four fixed rows: name, type, source and description. It reads `BAIArtifactDescriptionsFragment` on `Artifact`, so the caller spreads that fragment on the artifact node — the fragment also spreads `BAIArtifactTypeTagFragment`, which is what renders the type row. The source row is a BAILink opening `source.url` in a new tab with `source.name` as its text, and falls back to an empty href when the artifact carries no URL; an artifact with no description shows "N/A" instead of an empty row. The component takes no layout props — place it inside the surrounding BAIFlex or card that owns its spacing.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread `BAIArtifactDescriptionsFragment` on the artifact node in the page or modal query; spreading `BAIArtifactTypeTagFragment` separately is unnecessary because this fragment already includes it.',
      },
      {
        guidance: true,
        description:
          'Use it as the shared header of artifact-scoped modals — BAIImportArtifactModal and BAIDeleteArtifactRevisionsModal both render it above their revision table, which is what keeps those two surfaces consistent.',
      },
      {
        guidance: true,
        description:
          'Guard the render on the artifact fragment being non-null; the prop is required and there is no built-in empty state.',
      },
      {
        guidance: false,
        description:
          'Expect the row set to be configurable — the four rows are hard-coded, so a surface needing different fields wants its own MetadataList.',
      },
      {
        guidance: false,
        description:
          'Rely on a full-width description row: the list is a two-column grid and every entry, name and description included, occupies one cell.',
      },
    ],
  },
  props: [
    {
      name: 'artifactFrgmt',
      type: 'BAIArtifactDescriptionsFragment$key',
      description:
        'Fragment reference for the artifact to summarize. It supplies `name`, `description`, `source { name url }` and the data BAIArtifactTypeTag reads for the type row.',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Artifact summary above a revision table in a modal',
      code: `<BAIFlex direction="column" gap="md" align="stretch">
  {selectedArtifact && (
    <BAIArtifactDescriptions artifactFrgmt={selectedArtifact} />
  )}
  <BAITable columns={columns} dataSource={revisions} />
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
