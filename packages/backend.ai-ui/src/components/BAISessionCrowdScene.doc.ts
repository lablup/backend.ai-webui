import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionCrowdScene',
  displayName: 'BAI Session Crowd Scene',
  category: 'Data Visualization',
  keywords: [
    'crowd',
    'scene',
    'pixel art',
    'office',
    'where is wally',
    'spotlight',
    'finder',
    'sessions',
    'resource share',
    'footprint',
    'poc',
  ],
  usage: {
    description:
      "A proof-of-concept \"Where's Wally\" office built from the BAI Pixel Office sprite atlas. Each zone (agent, resource group) is a pixel-art room — a wall with a name sign, the session count and server racks, a planked floor, and a queue lane at the door. Each session is a character of fixed size; what it holds is drawn as its furniture. A working or overheated session sits at a desk with a monitor, an idle one sits on a sofa in the room's lounge carpet, a terminating one walks away from its fading desk, and a waiting one has no furniture yet and queues at the door holding a numbered ticket (`queuePosition`, else its place in line). The desk or sofa, and the rug of floor under it, step up small → medium → large with `resourceShare` — the session's share of its agent's capacity, the largest of cpu, gpu and memory — at < 34%, 34–67% and ≥ 67%. The steps are buckets, not a proportional chart; the exact share is in the hover card, and a share that is `null` draws a dashed small rug with a \"?\". The viewer's own sessions (`isHero`) keep the striped sprite in every state, with smoke and a hot icon or a suitcase icon added where the plain sprites show it on the face. `finders` work as in the other session scenes: the active one spotlights its matches, dims the rest and outlines the rooms that hold one. Sprites render at an integer `pixelScale` with `image-rendering: pixelated`; motion is a 1px bob paced by `utilization`, stepped smoke and Z frames, and a short walk, all off under `prefers-reduced-motion`.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Compute `resourceShare` against the agent's capacity, not the session's own allocation: it is what the furniture means. Use `utilization` (within the session's allocation) for \"GPU ≥ 90%\"-style finders.",
      },
      {
        guidance: true,
        description:
          'Smooth the share over 5–15 seconds before passing it, so a session near 34% or 67% does not swap its desk on every poll.',
      },
      {
        guidance: true,
        description:
          'Pass `null` while a share is not measured yet; `0` draws a small desk as though the session held nothing.',
      },
      {
        guidance: false,
        description:
          'Setting a fractional scale or a CSS transform on the scene — the atlas is pixel art and blurs off the integer grid.',
      },
      {
        guidance: false,
        description:
          'Mixing actual usage and allocation in one scene; if only allocation is known, pass that and say so in the surrounding UI.',
      },
    ],
  },
  props: [
    {
      name: 'figures',
      type: 'ReadonlyArray<BAICrowdFigure>',
      description:
        'The sessions to draw: `key`, `name`, optional `owner`, `zoneKey`, `mood` (`working` | `idle` | `overheated` | `waiting` | `leaving`), optional 0..1 `utilization`, optional 0..1 `resourceShare` (or `null` while unmeasured) that sizes the furniture, optional `queuePosition` for a waiting one, `isHero` for the striped sprite and optional `detail` for the hover card.',
      required: true,
    },
    {
      name: 'zones',
      type: 'ReadonlyArray<BAICrowdZone>',
      description:
        'The rooms, drawn in this order. A figure whose `zoneKey` matches no zone is not drawn.',
      required: true,
    },
    {
      name: 'finders',
      type: 'ReadonlyArray<BAICrowdFinder>',
      description:
        'Named predicates rendered as toggle buttons with their live match count; the active one spotlights its matches.',
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
      description: 'Called with the session the user clicked or activated.',
    },
    {
      name: 'pixelScale',
      type: '1 | 2',
      description: 'Integer scale of the sprites and the reserved floor.',
      default: '1',
    },
    {
      name: 'hideLegend',
      type: 'boolean',
      description: 'Hides the HUD legend of states and the three desk sizes.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Sessions grouped by agent, sized by their share of it',
      code: `<BAISessionCrowdScene
  zones={agents.map((a) => ({ key: a.id, label: a.id }))}
  figures={sessions.map((s) => ({
    key: s.id,
    name: s.name,
    owner: s.owner,
    zoneKey: s.agentId,
    mood: moodFor(s),
    utilization: s.gpuUtil,
    resourceShare: dominantShare(s.used, agentCapacity[s.agentId]),
    isHero: s.owner === me,
  }))}
  finders={finders}
  onFigureClick={(f) => openSession(f.key)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
