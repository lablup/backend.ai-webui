import BAIFlex from './BAIFlex';
import BAISessionCrowdScene, {
  type BAICrowdFigure,
  type BAICrowdFigureMood,
} from './BAISessionCrowdScene';
import { FINDERS, SESSIONS, toFigure, ZONES } from './SessionScene.fixtures';
import { Text } from '@lablup/ui-common/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAISessionCrowdScene> = {
  title: 'Lab/BAISessionCrowdScene',
  component: BAISessionCrowdScene,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAISessionCrowdScene** is a proof-of-concept "Where's Wally" office built
from the BAI Pixel Office asset pack. Each agent is a room; each session is a
fixed-size pixel character.

**What a session holds is its furniture.** A working session sits at a desk,
an idle one takes a lounge sofa, and both the furniture and the floor rug it
reserves step up **small → medium → large** with the session's share of the
agent's capacity (the largest of cpu / gpu / memory): < 34%, 34–67%, ≥ 67%.
The steps are buckets, not a proportional chart — the exact share is in the
hover card. A share that is not measured yet draws a dashed small rug with a
"?".

- **Overheated** — red-faced (or, for your own, smoke + a hot icon).
- **Idle** — on the lounge carpet, Z's floating.
- **Waiting** — no furniture yet; queues at the door holding a numbered ticket.
- **Terminating** — walks away from a fading desk with a suitcase.
- **Yours** — striped shirt, whatever the state.

**Finders** spotlight the matching sessions, dim the rest and outline the
rooms that hold a match. Sprites render at an integer \`pixelScale\` with
\`image-rendering: pixelated\`; under \`prefers-reduced-motion\` everything
holds on the first frame.
        `,
      },
    },
  },
  argTypes: {
    figures: { control: false },
    zones: { control: false },
    finders: { control: false },
    onFigureClick: { action: 'figure clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof BAISessionCrowdScene>;

export const FortySessions: Story = {
  name: 'Forty sessions, four agents',
  args: {
    zones: ZONES,
    figures: SESSIONS.map(toFigure),
    finders: FINDERS,
    'aria-label': 'Crowd scene of 40 sessions',
  },
};

export const SpotlightMine: Story = {
  name: 'Finder preselected (my sessions)',
  args: {
    ...FortySessions.args,
    activeFinderKey: 'mine',
  },
};

export const Controlled: Story = {
  name: 'Controlled finder + click handler',
  render: () => {
    const [finder, setFinder] = useState<string | null>('hot');
    const [picked, setPicked] = useState<BAICrowdFigure | null>(null);
    return (
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Text type="supporting">
          active finder: {finder ?? '—'} · last clicked:{' '}
          {picked ? `${picked.name} (${picked.owner})` : '—'}
        </Text>
        <BAISessionCrowdScene
          zones={ZONES}
          figures={SESSIONS.map(toFigure)}
          finders={FINDERS}
          activeFinderKey={finder}
          onActiveFinderChange={setFinder}
          onFigureClick={setPicked}
        />
      </BAIFlex>
    );
  },
};

const ladder = (
  mood: BAICrowdFigureMood,
  zoneKey: string,
  offset: number,
): BAICrowdFigure[] =>
  ([0.15, 0.5, 0.9, null] as const).map((share, i) => ({
    key: `${zoneKey}-${i}`,
    name: `${mood} ${share === null ? '?' : `${Math.round(share * 100)}%`}`,
    zoneKey,
    mood,
    utilization: 0.5,
    resourceShare: share,
    isHero: i === offset,
  }));

export const TierLadder: Story = {
  name: 'Furniture size = resource share',
  args: {
    zones: [
      { key: 'desks', label: 'desks: 15% · 50% · 90% · ?' },
      { key: 'sofas', label: 'sofas: 15% · 50% · 90% · ?' },
    ],
    figures: [...ladder('working', 'desks', 1), ...ladder('idle', 'sofas', 2)],
  },
};

export const EveryState: Story = {
  name: 'Every state, 2× pixels',
  args: {
    pixelScale: 2,
    hideLegend: true,
    zones: [{ key: 'z', label: 'a100-node-01' }],
    figures: (
      [
        ['working', 0.6, 0.4, false],
        ['working', 0.3, 0.8, true],
        ['overheated', 0.97, 0.7, false],
        ['overheated', 0.95, 0.5, true],
        ['idle', 0.02, 0.2, false],
        ['idle', 0.01, 0.6, true],
        ['leaving', undefined, 0.5, false],
        ['waiting', undefined, undefined, false],
        ['waiting', undefined, undefined, true],
      ] as Array<
        [BAICrowdFigureMood, number | undefined, number | undefined, boolean]
      >
    ).map(([mood, util, share, mine], i) => ({
      key: `m${i}`,
      name: `${mood}${mine ? ' (mine)' : ''}`,
      zoneKey: 'z',
      mood,
      utilization: util,
      resourceShare: share,
      isHero: mine,
    })),
  },
};

export const Empty: Story = {
  args: {
    zones: ZONES,
    figures: [],
    finders: FINDERS,
  },
};
