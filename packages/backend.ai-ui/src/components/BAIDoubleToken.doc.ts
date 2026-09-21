import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDoubleToken',
  displayName: 'BAI Double Token',
  category: 'Content',
  keywords: [
    'token',
    'tag',
    'chip',
    'label',
    'key value',
    'pair',
    'double token',
    'double tag',
  ],
  usage: {
    description:
      'Renders a run of Astryx Tokens welded into one continuous pill, for a settled key/value fact such as an image tag ("python" + "3.11"), a location/platform pair or a permission set. Settled means the value changes only when someone edits it; a pair the system changes on its own (a live status and its detail, a ticking duration) is BAIDoubleBadge. The segments come in as data — plain strings, which all render blue, or objects carrying an Astryx Token color (convert a runtime or antd colour string with tokenColorForTagColor / tokenColorForStatus first). With highlightKeyword set, each label is rendered through BAITextHighlighter so the matching substring is marked in place while the plain label stays the accessible name. Empty labels are skipped and an empty values array renders nothing.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for it when two parts are one fact — the joined pill is what tells the reader the segments belong together rather than being two separate tokens.',
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
          'Use it for a value the system changes while the user watches (status, elapsed time) — that is BAIDoubleBadge.',
      },
      {
        guidance: false,
        description:
          'Mix bare strings and objects in one values array; keep one shape per call site.',
      },
    ],
  },
  props: [
    {
      name: 'values',
      type: 'Array<string> | Array<BAIDoubleTokenValue>',
      description:
        'The segments, left to right. An array of strings renders every segment blue; an array of objects gives each one a label and an optional Astryx Token color (default blue). An empty array renders nothing.',
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
      code: `<BAIDoubleToken
  values={[
    { label: location, color: tokenColorForStatus('cloudPlatform', platform) },
    { label: platform, color: tokenColorForStatus('cloudPlatform', platform) },
  ]}
/>`,
    },
    {
      label: 'Image tag with search highlighting',
      code: `<BAIDoubleToken
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
