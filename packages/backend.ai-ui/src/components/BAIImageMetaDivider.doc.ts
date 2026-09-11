import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIImageMetaDivider',
  displayName: 'BAI Image Meta Divider',
  category: 'Layout',
  keywords: ['image', 'divider', 'separator', 'meta', 'row'],
  usage: {
    description:
      "The separator between the parts of an image meta row (ADR 0004). Astryx's vertical `Divider` is `height: 100%`, which collapses to zero inside a centered flex row, so this component fixes the metrics the image rows need: centered on the cross axis, `0.9em` tall, with the extra-small inline margin the antd-era rows had. Take it rather than a bare `Divider` wherever image parts are separated — `BAIImageMetaRow` uses it between the name, the version, the architecture and the chips, and the session launcher's environment select uses it between the version and the architecture of an option row.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it for every separator inside an image meta row, so the rows line up across screens.',
      },
      {
        guidance: false,
        description:
          'Reach for `Divider orientation="vertical"` directly in a flex row — it renders as a zero-height line.',
      },
    ],
  },
  props: [],
  examples: [
    {
      label: 'Between the parts of an option row',
      code: `<BAIFlex direction="row">
  <span>{image.version}</span>
  <BAIImageMetaDivider />
  <span>{image.architecture}</span>
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
