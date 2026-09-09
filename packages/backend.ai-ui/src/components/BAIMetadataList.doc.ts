import type { ComponentDoc } from '@astryxdesign/cli/authoring';

// No `type: 'component'` stamp: CLI 0.5.0's stamped component schema requires
// a top-level `props` array and has no multi-component variant, so a stamped
// `components` doc fails validation. Unstamped docs are shape-sniffed and the
// multi form is accepted.
export const docs = {
  name: 'BAIMetadataList',
  displayName: 'BAI Metadata List',
  category: 'Content',
  keywords: [
    'metadata',
    'descriptions',
    'definition list',
    'key value',
    'details',
    'properties',
    'attributes',
  ],
  usage: {
    description:
      'The label/value list used on detail panels, info modals and drawers. It renders Astryx MetadataList and adds one thing: an opt-in `bordered` variant that restores the framed, ruled label/value table antd `Descriptions bordered` used to draw. Without `bordered` the list keeps Astryx’s own layout with two always-on adjustments: the label is lightened to read quieter than its value, and side labels are top-aligned with their value’s first line (FR-3667). With it, one class from `BAIMetadataList.css` frames the list, rules it into cells drawn as the grid gap, and puts the label column on a muted fill, entirely in design tokens. Everything else — `columns`, `title`, `orientation`, `maxNumOfItems` — is MetadataList’s own surface and passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Treat `bordered` as a per-surface choice: adopt it where the plain list runs together into one undifferentiated block, and leave the rest plain.',
      },
      {
        guidance: true,
        description:
          'Let `bordered` supply side labels rather than restating them — it defaults `label` to `{ position: "start" }`, which is what the rules are drawn against.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIMetadataListItem instead of the Astryx MetadataListItem when a row label needs to be a node, such as a label plus a help-icon tooltip.',
      },
      {
        guidance: false,
        description:
          'Combine `bordered` with `label={{ position: "top" }}` — stacked labels inside the ruled table have no antd equivalent and are not styled.',
      },
      {
        guidance: false,
        description:
          'Expect `size` to do anything on a plain list; it only sets the bordered cell padding, exactly as in antd.',
      },
    ],
  },
  components: [
    {
      name: 'BAIMetadataList',
      displayName: 'BAI Metadata List',
      description:
        'The list container. Renders Astryx MetadataList, plus the opt-in bordered treatment.',
      props: [
        {
          name: 'bordered',
          type: 'boolean',
          description:
            'Frames the list and rules it into label/value cells with a muted label column. Also flips the default label position to the side, since the rules only make sense against a label/value track pair.',
          default: 'false',
        },
        {
          name: 'size',
          type: "'default' | 'middle' | 'small'",
          description:
            'Bordered cell padding — 16/24px, 12/24px, 8/16px. No effect without `bordered`.',
          default: "'default'",
        },
        {
          name: 'label',
          type: "{ position?: 'start' | 'top' }",
          description:
            'MetadataList label placement. Passed through untouched; when omitted and `bordered` is set, it defaults to side labels.',
        },
        {
          name: 'className',
          type: 'string',
          description:
            'Extra classes, appended after the bordered and size classes the component adds.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'The row elements — BAIMetadataListItem, or Astryx MetadataListItem where a string label is enough.',
        },
      ],
    },
    {
      name: 'BAIMetadataListItem',
      displayName: 'BAI Metadata List Item',
      description:
        'One label/value row. It exists to widen the label to a ReactNode: Astryx types `label` as a string, but MetadataListItem renders it as a JSX child, so a node works.',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description:
            'Row label. A node is allowed here, unlike on the Astryx item — useful for a label paired with an icon or tooltip.',
          required: true,
        },
      ],
    },
  ],
  examples: [
    {
      label: 'Bordered info table in a modal',
      code: `<BAIMetadataList bordered>
  {descriptionItems.map((item) => (
    <MetadataListItem key={item.key} label={item.label}>
      {item.children}
    </MetadataListItem>
  ))}
</BAIMetadataList>`,
    },
    {
      label: 'Single-column bordered list with a node label',
      code: `<BAIMetadataList bordered columns="single">
  <BAIMetadataListItem
    label={
      <BAIFlex gap="xxs">
        {t('agent.ResourceAllocation')}
        <BAIQuestionIconWithTooltip title={t('agent.ResourceAllocationDesc')} />
      </BAIFlex>
    }
  >
    <AgentResourceGrid agentFrgmt={agent} />
  </BAIMetadataListItem>
</BAIMetadataList>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
