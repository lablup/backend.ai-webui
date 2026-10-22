import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionPinwheelMeadow',
  displayName: 'BAI Session Pinwheel Meadow',
  category: 'Data Visualization',
  keywords: [
    'pinwheel',
    'meadow',
    'scene',
    'illustration',
    'sessions',
    'utilization',
    'spin speed',
    'playful',
    'poc',
  ],
  usage: {
    description:
      'A proof-of-concept, hand-painted rendering of a session list, sibling of `BAISessionCrowdScene` and taking exactly the same props. Each zone (agent, resource group) is a hillside vignette under a drifting summer sky on watercolour paper, with a wooden sign for its name; each session is a two-colour paper pinwheel planted in its grass. A working pinwheel spins as fast as its `utilization` (3.4s per turn at 0 down to 0.3s at 1) with a blur disc behind the blades that widens with speed; an overheated one whirls in warm paper and throws embers; an idle one stands still and faded with a dragonfly resting on it; a waiting one is an uncut sheet bobbing with a queue ticket; a terminating one loses its blades to the wind; an `isHero` one wears a red ribbon. The breeze lines in each sky run faster and brighter with the mean utilization of the spinning pinwheels on that hillside. Finders spotlight their matches with a sunbeam and dim the rest. Light mode is a summer afternoon and dark mode is dusk; the scene palette is component-local, since it is an illustration rather than chrome.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it as an at-a-glance overview of tens of sessions where "which hillside is windy" matters more than exact numbers — the hover card carries the exact utilization.',
      },
      {
        guidance: true,
        description:
          'Derive `mood` from the same utilization thresholds the resource grid uses, so a whirling pinwheel and a red grid cell always agree.',
      },
      {
        guidance: false,
        description:
          'Relying on spin speed alone — under reduced motion the meadow stands still, and only the blur disc and the props still carry the state.',
      },
      {
        guidance: false,
        description:
          'Feeding a fast-changing utilization straight in: the spin duration jumps when it changes, so smooth or bucket the value before it reaches the scene.',
      },
    ],
  },
  props: [
    {
      name: 'figures',
      type: 'ReadonlyArray<BAICrowdFigure>',
      description:
        'The sessions to plant, the same shape `BAISessionCrowdScene` takes: `key`, `name`, optional `owner`, `zoneKey`, `mood`, an optional 0..1 `utilization` that sets the spin speed, `isHero` for the red ribbon and optional `detail` for the hover card. The paper colours are picked from the `key`, so a session keeps its pinwheel across re-renders.',
      required: true,
    },
    {
      name: 'zones',
      type: 'ReadonlyArray<BAICrowdZone>',
      description:
        'The hillsides, drawn in this order. A figure whose `zoneKey` matches no zone is not drawn.',
      required: true,
    },
    {
      name: 'finders',
      type: 'ReadonlyArray<BAICrowdFinder>',
      description:
        'Named predicates rendered as toggle buttons with their live match count; the active one puts a sunbeam on its matches.',
    },
    {
      name: 'activeFinderKey',
      type: 'string | null',
      description: 'Controlled active finder. Omit to keep it in local state.',
    },
    {
      name: 'onActiveFinderChange',
      type: '(key: string | null) => void',
      description: 'Called when a finder is toggled or cleared (`null`).',
    },
    {
      name: 'onFigureClick',
      type: '(figure: BAICrowdFigure) => void',
      description: 'Called with the pinwheel the user clicked or activated.',
    },
    {
      name: 'hideLegend',
      type: 'boolean',
      description: 'Hides the mood legend row under the hillsides.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Same data as the crowd scene, switched by a segmented control',
      code: `{view === 'meadow' ? (
  <BAISessionPinwheelMeadow zones={zones} figures={figures} finders={finders} />
) : (
  <BAISessionCrowdScene zones={zones} figures={figures} finders={finders} />
)}`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
