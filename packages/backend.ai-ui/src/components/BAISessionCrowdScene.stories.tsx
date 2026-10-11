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
  title: 'Data Display/BAISessionCrowdScene',
  component: BAISessionCrowdScene,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAISessionCrowdScene** is a proof-of-concept "Where's Wally" rendering of a
session list. Each session is a small figure in the zone (agent) it runs on;
its state is a prop — swinging arms whose speed follows utilization, smoke and
a red face above the error threshold, floating z's when idle, a numbered
ticket while pending, a suitcase while terminating — and the viewer's own
sessions wear the striped shirt.

**Finders** are named predicates. Toggling one spotlights the matching
figures, dims the rest, outlines the zones that hold a match and shows the
found count, so "find mine / find the hot ones" is the interaction.

Everything is theme-token coloured and CSS-animated; under
\`prefers-reduced-motion\` the crowd stands still and the props still carry
every state.
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

export const EveryMood: Story = {
  name: 'Every mood side by side',
  args: {
    zones: [{ key: 'z', label: 'moods' }],
    hideLegend: true,
    figures: (
      [
        ['working', 0.1],
        ['working', 0.5],
        ['working', 1],
        ['overheated', 0.97],
        ['idle', 0.02],
        ['waiting', undefined],
        ['leaving', undefined],
      ] as Array<[BAICrowdFigureMood, number | undefined]>
    ).map(([mood, util], i) => ({
      key: `m${i}`,
      name: `${mood}${util !== undefined ? ` ${Math.round(util * 100)}%` : ''}`,
      zoneKey: 'z',
      mood,
      utilization: util,
      isHero: i === 1,
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
