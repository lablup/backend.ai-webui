import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDoubleTag',
  displayName: 'BAI Double Tag',
  category: 'Content',
  keywords: [
    'tag',
    'chip',
    'badge',
    'label',
    'key value',
    'pair',
    'double tag',
  ],
  usage: {
    description:
      'Renders a run of Astryx Badges welded into one continuous pill, for key/value metadata such as an image tag ("python" + "3.11") or a location/platform pair. The segments come in as data — plain strings, which all render blue, or objects carrying an antd-preset color name that the repo-global tag lookup maps onto an Astryx Badge variant (an unknown color drops to neutral). With highlightKeyword set, each label runs through BAITextHighlighter so the matching substring is marked in place. Empty labels are skipped and an empty values array renders nothing.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for it when two parts are one fact — the joined pill is what tells the reader the segments belong together rather than being two separate tags.',
      },
      {
        guidance: true,
        description:
          'Thread the list search term through highlightKeyword so filtered rows show why they matched.',
      },
      {
        guidance: true,
        description:
          'Give both segments the same color when they express one value, and differentiate only when a segment means something else (a customized alias, for instance).',
      },
      {
        guidance: false,
        description:
          'Count on long labels truncating — every segment renders in full, so trim the text upstream if the column is narrow.',
      },
      {
        guidance: false,
        description:
          'Mix bare strings and objects in one values array; the first entry decides how the whole array is read.',
      },
    ],
  },
  props: [
    {
      name: 'values',
      type: 'Array<string> | Array<DoubleTagObjectValue>',
      description:
        'The segments, left to right. An array of strings renders every segment blue; an array of objects gives each one a label and an optional antd-preset color name. An empty array renders nothing.',
      default: '[]',
    },
    {
      name: 'highlightKeyword',
      type: 'string',
      description:
        'Search term marked inside every segment label through BAITextHighlighter. Left unset, labels render as plain text.',
    },
  ],
  examples: [
    {
      label: 'Location and platform pair',
      code: `<BAIDoubleTag
  values={[
    { label: location, color: color },
    { label: platform, color: color },
  ]}
/>`,
    },
    {
      label: 'Image tag with search highlighting',
      code: `<BAIDoubleTag
  highlightKeyword={highlightKeyword}
  values={[
    { label: tagAlias(tag.key), color: isCustomized ? 'cyan' : 'blue' },
    { label: tagValue ?? '', color: 'blue' },
  ]}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
