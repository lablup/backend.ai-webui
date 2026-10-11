import BAIFlex from './BAIFlex';
import BAISessionCrowdScene from './BAISessionCrowdScene';
import BAISessionPinwheelMeadow from './BAISessionPinwheelMeadow';
import { FINDERS, SESSIONS, toFigure, ZONES } from './SessionScene.fixtures';
import type { BAICrowdFigure, BAICrowdFigureMood } from './SessionSceneParts';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@lablup/ui-common/SegmentedControl';
import { Text } from '@lablup/ui-common/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAISessionPinwheelMeadow> = {
  title: 'Data Display/BAISessionPinwheelMeadow',
  component: BAISessionPinwheelMeadow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAISessionPinwheelMeadow** is a proof-of-concept, hand-painted rendering of
a session list. Each agent is a hillside under a drifting summer sky; each
session is a paper pinwheel planted on it.

- **Working** — spins as fast as its utilization (3.4s per turn → 0.3s), with
  a blur disc behind the blades that widens with speed.
- **Overheated** — warm paper, whirling, throwing embers.
- **Idle** — stands still, faded, a dragonfly resting on the top blade.
- **Waiting** — a sheet not yet cut open, bobbing with a queue ticket.
- **Terminating** — the blades come loose and blow away.
- **Yours** — a red ribbon tied under the hub.

The breeze lines in each sky run faster and brighter the busier that hillside
is. Finders work as in \`BAISessionCrowdScene\`: a sunbeam falls on what they
find. Light mode is a summer afternoon, dark mode is dusk. Under
\`prefers-reduced-motion\` the meadow holds still; the blur disc still shows
each pinwheel's speed.
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
type Story = StoryObj<typeof BAISessionPinwheelMeadow>;

export const FortySessions: Story = {
  name: 'Forty sessions, four agents',
  args: {
    zones: ZONES,
    figures: SESSIONS.map(toFigure),
    finders: FINDERS,
    'aria-label': 'Pinwheel meadow of 40 sessions',
  },
};

export const SpotlightMine: Story = {
  name: 'Finder preselected (my sessions)',
  args: {
    ...FortySessions.args,
    activeFinderKey: 'mine',
  },
};

export const SpeedRamp: Story = {
  name: 'Utilization → spin speed',
  args: {
    zones: [{ key: 'z', label: 'speed ramp' }],
    hideLegend: true,
    figures: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1].map((util, i) => ({
      key: `s${i}`,
      name: `${Math.round(util * 100)}%`,
      zoneKey: 'z',
      mood: 'working' as const,
      utilization: util,
    })),
  },
};

export const EveryMood: Story = {
  name: 'Every mood side by side',
  args: {
    zones: [{ key: 'z', label: 'moods' }],
    hideLegend: true,
    figures: (
      [
        ['working', 0.2],
        ['working', 0.6],
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

export const CompareWithCrowd: Story = {
  name: 'Same data: meadow ↔ crowd',
  render: () => {
    const [view, setView] = useState('meadow');
    const [finder, setFinder] = useState<string | null>(null);
    const [picked, setPicked] = useState<BAICrowdFigure | null>(null);
    const shared = {
      zones: ZONES,
      figures: SESSIONS.map(toFigure),
      finders: FINDERS,
      activeFinderKey: finder,
      onActiveFinderChange: setFinder,
      onFigureClick: setPicked,
    };
    return (
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex gap="sm" align="center">
          <SegmentedControl label="View" value={view} onChange={setView}>
            <SegmentedControlItem value="meadow" label="Pinwheel meadow" />
            <SegmentedControlItem value="crowd" label="Crowd" />
          </SegmentedControl>
          <Text type="supporting">
            last clicked: {picked ? `${picked.name} (${picked.owner})` : '—'}
          </Text>
        </BAIFlex>
        {view === 'meadow' ? (
          <BAISessionPinwheelMeadow {...shared} />
        ) : (
          <BAISessionCrowdScene {...shared} />
        )}
      </BAIFlex>
    );
  },
};
