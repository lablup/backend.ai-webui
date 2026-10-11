import BAIFlex from './BAIFlex';
import BAISessionCrowdScene, {
  type BAICrowdFigure,
  type BAICrowdFigureMood,
  type BAICrowdFinder,
  type BAICrowdZone,
} from './BAISessionCrowdScene';
import { Text } from '@lablup/ui-common/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Clock, Flame, Hourglass, UserRound } from 'lucide-react';
import { useState } from 'react';

const ME = 'jongeun';

const ZONES: BAICrowdZone[] = [
  { key: 'a100-01', label: 'a100-node-01' },
  { key: 'a100-02', label: 'a100-node-02' },
  { key: 'h100-01', label: 'h100-node-01' },
  { key: 'cpu', label: 'cpu-pool' },
];

const OWNERS = ['alice', 'bob', 'carol', 'dave', 'erin', ME];

// Deterministic pseudo-random so the crowd is the same on every render.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

interface MockSession {
  id: string;
  name: string;
  owner: string;
  agent: string;
  status: 'RUNNING' | 'PENDING' | 'TERMINATING';
  util: number;
  idleMinutes: number;
  pendingMinutes: number;
}

const makeSessions = (count: number): MockSession[] =>
  Array.from({ length: count }, (_, i) => {
    const r = rand(i + 1);
    const status: MockSession['status'] =
      r < 0.12 ? 'PENDING' : r < 0.17 ? 'TERMINATING' : 'RUNNING';
    const util = Math.round(rand(i + 100) * 100) / 100;
    return {
      id: `sess-${i + 1}`,
      name: `${['train', 'infer', 'notebook', 'batch', 'finetune'][i % 5]}-${i + 1}`,
      owner: OWNERS[Math.floor(rand(i + 200) * OWNERS.length)],
      agent: ZONES[Math.floor(rand(i + 300) * ZONES.length)].key,
      status,
      util,
      idleMinutes: util < 0.08 ? Math.floor(rand(i + 400) * 600) : 0,
      pendingMinutes: status === 'PENDING' ? Math.floor(rand(i + 500) * 40) : 0,
    };
  });

const moodFor = (s: MockSession): BAICrowdFigureMood => {
  if (s.status === 'PENDING') return 'waiting';
  if (s.status === 'TERMINATING') return 'leaving';
  if (s.util >= 0.9) return 'overheated';
  if (s.util < 0.08) return 'idle';
  return 'working';
};

const toFigure = (s: MockSession): BAICrowdFigure => ({
  key: s.id,
  name: s.name,
  owner: s.owner,
  zoneKey: s.agent,
  mood: moodFor(s),
  utilization: s.status === 'RUNNING' ? s.util : undefined,
  isHero: s.owner === ME,
  detail:
    s.idleMinutes > 0 ? (
      <Text type="supporting">idle for {s.idleMinutes} min</Text>
    ) : s.pendingMinutes > 0 ? (
      <Text type="supporting">pending for {s.pendingMinutes} min</Text>
    ) : undefined,
});

const SESSIONS = makeSessions(40);
const byId = new Map(SESSIONS.map((s) => [s.id, s]));

const FINDERS: BAICrowdFinder[] = [
  {
    key: 'mine',
    label: 'My sessions',
    icon: <UserRound size="1em" />,
    match: (f) => !!f.isHero,
  },
  {
    key: 'hot',
    label: 'GPU ≥ 90%',
    icon: <Flame size="1em" />,
    match: (f) => (f.utilization ?? 0) >= 0.9,
  },
  {
    key: 'idle',
    label: 'Idle > 3h',
    icon: <Clock size="1em" />,
    match: (f) => (byId.get(f.key)?.idleMinutes ?? 0) > 180,
  },
  {
    key: 'pending',
    label: 'Pending > 10 min',
    icon: <Hourglass size="1em" />,
    match: (f) => (byId.get(f.key)?.pendingMinutes ?? 0) > 10,
  },
];

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
