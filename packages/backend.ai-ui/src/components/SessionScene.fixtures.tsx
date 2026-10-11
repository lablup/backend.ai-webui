/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Story fixtures shared by the session scene stories: 40 deterministic mock
 sessions over four agents, and four finders.
 */
import type {
  BAICrowdFigure,
  BAICrowdFigureMood,
  BAICrowdFinder,
  BAICrowdZone,
} from './SessionSceneParts';
import { Text } from '@lablup/ui-common/Text';
import { Clock, Flame, Hourglass, UserRound } from 'lucide-react';

const ME = 'jongeun';

export const ZONES: BAICrowdZone[] = [
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

export const moodFor = (s: MockSession): BAICrowdFigureMood => {
  if (s.status === 'PENDING') return 'waiting';
  if (s.status === 'TERMINATING') return 'leaving';
  if (s.util >= 0.9) return 'overheated';
  if (s.util < 0.08) return 'idle';
  return 'working';
};

export const toFigure = (s: MockSession): BAICrowdFigure => ({
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

export const SESSIONS = makeSessions(40);
const byId = new Map(SESSIONS.map((s) => [s.id, s]));

export const FINDERS: BAICrowdFinder[] = [
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
