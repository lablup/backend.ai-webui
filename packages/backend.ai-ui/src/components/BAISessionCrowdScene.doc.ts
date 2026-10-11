import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionCrowdScene',
  displayName: 'BAI Session Crowd Scene',
  category: 'Data Visualization',
  keywords: [
    'crowd',
    'scene',
    'figures',
    'where is wally',
    'spotlight',
    'finder',
    'sessions',
    'utilization',
    'playful',
    'poc',
  ],
  usage: {
    description:
      'A proof-of-concept "Where\'s Wally" view of a session list. Every session is a small cartoon figure standing in the zone (agent, resource group) the caller assigns it to; its state shows only as a prop — a working figure swings its arms at a speed that follows `utilization`, an idle one slumps under floating z\'s, an overheated one shivers under smoke, a waiting one holds a numbered ticket, a leaving one carries a suitcase — and the sessions the caller marks `isHero` wear the striped shirt, bobble hat and round glasses. `finders` are named predicates rendered as toggle buttons with their match count; the active one spotlights the matching figures, dims the rest, outlines the zones that hold a match and shows a found-count Badge, so "which one is mine / over 90% / idle for hours" becomes a search the eye enjoys. Hovering a figure opens a Tooltip card with its name, owner, mood and utilization; clicking fires `onFigureClick`. The scene is data-agnostic — callers map their sessions to `BAICrowdFigure`s — and all motion is CSS driven by two inline custom properties, switched off under `prefers-reduced-motion`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the figure count in the tens: the view is for recognising one session in a crowd, and past ~100 figures the grid view carries the same information more legibly.',
      },
      {
        guidance: true,
        description:
          'Map `zoneKey` to something physical the user already reasons about — an agent or a resource group — so a busy zone reads as a busy place.',
      },
      {
        guidance: true,
        description:
          'Reuse the live utilization thresholds when deriving `mood` (`overheated` above the error threshold, `idle` below the idle one) so the crowd never disagrees with the grid colours next to it.',
      },
      {
        guidance: false,
        description:
          'Encoding anything only in motion — reduced-motion users see a still crowd, so every state must also be visible as a prop or a tint.',
      },
      {
        guidance: false,
        description:
          'Marking more than a handful of figures `isHero`; the striped shirt is the one thing to find, and a crowd of Wallies finds nothing.',
      },
    ],
  },
  props: [
    {
      name: 'figures',
      type: 'ReadonlyArray<BAICrowdFigure>',
      description:
        'The sessions to draw. Each carries a `key`, `name`, optional `owner`, the `zoneKey` it stands in, a `mood` (`working` | `idle` | `overheated` | `waiting` | `leaving`), an optional 0..1 `utilization` that paces a working figure, `isHero` for the striped shirt and optional `detail` nodes for the hover card.',
      required: true,
    },
    {
      name: 'zones',
      type: 'ReadonlyArray<BAICrowdZone>',
      description:
        'The places figures stand in, drawn in this order as outlined plates with a label and a head count. A figure whose `zoneKey` matches no zone is not drawn.',
      required: true,
    },
    {
      name: 'finders',
      type: 'ReadonlyArray<BAICrowdFinder>',
      description:
        'Named predicates (`key`, `label`, optional `icon`, `match`) rendered as toggle buttons with their live match count. The active finder spotlights its matches and dims everything else.',
    },
    {
      name: 'activeFinderKey',
      type: 'string | null',
      description:
        'Controlled active finder. Omit to let the scene keep the selection in local state.',
    },
    {
      name: 'onActiveFinderChange',
      type: '(key: string | null) => void',
      description:
        'Called when the user toggles a finder or presses "Show all" (`null`).',
    },
    {
      name: 'onFigureClick',
      type: '(figure: BAICrowdFigure) => void',
      description: 'Called with the figure the user clicked or activated.',
    },
    {
      name: 'hideLegend',
      type: 'boolean',
      description: 'Hides the mood legend row under the zones.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Sessions grouped by agent with three finders',
      code: `<BAISessionCrowdScene
  zones={[
    { key: 'a100-01', label: 'a100-node-01' },
    { key: 'cpu', label: 'cpu-pool' },
  ]}
  figures={sessions.map((s) => ({
    key: s.id,
    name: s.name,
    owner: s.owner,
    zoneKey: s.agent,
    mood: moodFor(s),
    utilization: s.cpuUtil / 100,
    isHero: s.owner === me,
  }))}
  finders={[
    { key: 'mine', label: 'My sessions', match: (f) => !!f.isHero },
    { key: 'hot', label: 'GPU ≥ 90%', match: (f) => (f.utilization ?? 0) >= 0.9 },
    { key: 'idle', label: 'Idle', match: (f) => f.mood === 'idle' },
  ]}
  onFigureClick={(f) => openSession(f.key)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
