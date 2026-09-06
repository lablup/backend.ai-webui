/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionLiveStats } from './mergeKernelLiveStats';
import {
  availableLiveStatMetrics,
  availableResourceOptions,
  availableResourceSlots,
  isNotYetAllocatedSession,
  kernelMetricPct,
  memKeyForSlot,
  parseResourceValue,
  sessionHasResource,
  MAX_UNITS_PER_SESSION,
  parseSlotMap,
  sessionGridUnits,
  sessionUtilizationPct,
  utilizationFill,
  UtilizationFills,
  utilKeyForSlot,
} from './sessionResourceGridData';

const GiB = 2 ** 30;

const fills: UtilizationFills = {
  bins: ['low', 'warn1', 'warn2', 'warn3', 'error'],
  noData: 'no-data',
};

const liveStatWithPct = (key: string, pct: string): SessionLiveStats => ({
  [key]: { current: '0', capacity: '0', pct, unit_hint: '' },
});

describe('parseSlotMap', () => {
  it('parses occupied slots including dynamic accelerator keys', () => {
    const { slots, slotsAreRequested } = parseSlotMap(
      JSON.stringify({
        cpu: '4',
        mem: String(8 * GiB),
        'cuda.shares': '2.5',
        'hyperaccel-lpu.device': '1',
      }),
      '{}',
    );
    expect(slotsAreRequested).toBe(false);
    expect(slots).toEqual({
      cpu: '4',
      mem: String(8 * GiB),
      'cuda.shares': '2.5',
      'hyperaccel-lpu.device': '1',
    });
  });

  it('falls back to requested_slots while occupied is empty (PENDING)', () => {
    const { slots, slotsAreRequested } = parseSlotMap(
      '{}',
      JSON.stringify({ cpu: '2', mem: String(GiB) }),
    );
    expect(slotsAreRequested).toBe(true);
    expect(slots).toEqual({ cpu: '2', mem: String(GiB) });
  });

  it('treats null/invalid/non-object payloads as empty', () => {
    expect(parseSlotMap(null, null)).toEqual({
      slots: {},
      slotsAreRequested: true,
    });
    expect(parseSlotMap('{broken', '[1]')).toEqual({
      slots: {},
      slotsAreRequested: true,
    });
  });
});

describe('utilKeyForSlot', () => {
  it('maps slot keys to their live_stat metric keys', () => {
    expect(utilKeyForSlot('cpu')).toBe('cpu_util');
    expect(utilKeyForSlot('mem')).toBe('mem');
    expect(utilKeyForSlot('cuda.shares')).toBe('cuda_util');
    expect(utilKeyForSlot('cuda.device')).toBe('cuda_util');
    expect(utilKeyForSlot('hyperaccel-lpu.device')).toBe('hyperaccel_lpu_util');
  });
});

describe('sessionUtilizationPct / kernelMetricPct', () => {
  it('reads the pct of the slot metric for live sessions', () => {
    expect(
      sessionUtilizationPct(
        'RUNNING',
        liveStatWithPct('cpu_util', '42.5'),
        'cpu',
      ),
    ).toBe(42.5);
    expect(
      sessionUtilizationPct(
        'TERMINATING',
        liveStatWithPct('cuda_util', '10'),
        'cuda.shares',
      ),
    ).toBe(10);
  });

  it('returns null for non-live sessions even with data present', () => {
    expect(
      sessionUtilizationPct(
        'PENDING',
        liveStatWithPct('cpu_util', '42.5'),
        'cpu',
      ),
    ).toBeNull();
    expect(
      sessionUtilizationPct('TERMINATED', liveStatWithPct('mem', '10'), 'mem'),
    ).toBeNull();
  });

  it('returns null for missing or non-numeric stats', () => {
    expect(sessionUtilizationPct('RUNNING', {}, 'cpu')).toBeNull();
    expect(
      sessionUtilizationPct(
        'RUNNING',
        liveStatWithPct('cpu_util', 'NaN'),
        'cpu',
      ),
    ).toBeNull();
  });

  it('reads kernel metrics by raw key with the same liveness gate', () => {
    expect(
      kernelMetricPct('RUNNING', liveStatWithPct('mem', '77'), 'mem'),
    ).toBe(77);
    expect(
      kernelMetricPct('PULLING', liveStatWithPct('mem', '77'), 'mem'),
    ).toBeNull();
  });
});

describe('utilizationFill', () => {
  it('maps percent bands to the 5 semantic fills (50/80 thresholds)', () => {
    expect(utilizationFill(0, fills)).toBe('low');
    expect(utilizationFill(49.9, fills)).toBe('low');
    expect(utilizationFill(50, fills)).toBe('warn1');
    expect(utilizationFill(59.9, fills)).toBe('warn1');
    expect(utilizationFill(60, fills)).toBe('warn2');
    expect(utilizationFill(70, fills)).toBe('warn3');
    expect(utilizationFill(79.9, fills)).toBe('warn3');
    expect(utilizationFill(80, fills)).toBe('error');
    expect(utilizationFill(100, fills)).toBe('error');
  });

  it('clamps out-of-range percents', () => {
    expect(utilizationFill(-5, fills)).toBe('low');
    expect(utilizationFill(250, fills)).toBe('error');
  });

  it('returns the no-data fill for null/non-finite', () => {
    expect(utilizationFill(null, fills)).toBe('no-data');
    expect(utilizationFill(NaN, fills)).toBe('no-data');
  });
});

describe('sessionGridUnits — resource mode', () => {
  const runningSession = (slots: Record<string, string>) => ({
    status: 'RUNNING',
    slots,
    liveStat: liveStatWithPct('cpu_util', '55'),
    kernels: [],
  });
  const baseOptions = {
    mode: 'resource' as const,
    resource: 'cpu',
    metric: 'cpu_util',
    memUnitGiB: 1,
    fills,
  };

  it('emits one unit per CPU core, colored by utilization', () => {
    const units = sessionGridUnits(runningSession({ cpu: '4' }), baseOptions);
    expect(units).toHaveLength(4);
    expect(units.every((u) => u.color === 'warn1')).toBe(true);
    expect(units.every((u) => u.fraction === undefined)).toBe(true);
  });

  it('divides memory by the selected GiB unit', () => {
    const session = {
      status: 'RUNNING',
      slots: { mem: String(8 * GiB) },
      liveStat: liveStatWithPct('mem', '10'),
      kernels: [],
    };
    expect(
      sessionGridUnits(session, {
        ...baseOptions,
        resource: 'mem',
        memUnitGiB: 2,
      }),
    ).toHaveLength(4);
    expect(
      sessionGridUnits(session, {
        ...baseOptions,
        resource: 'mem',
        memUnitGiB: 8,
      }),
    ).toHaveLength(1);
  });

  it('emits a partial-fill cell for the fractional memory remainder', () => {
    const units = sessionGridUnits(
      {
        status: 'RUNNING',
        slots: { mem: String(3 * GiB) },
        liveStat: liveStatWithPct('mem', '10'),
        kernels: [],
      },
      { ...baseOptions, resource: 'mem', memUnitGiB: 2 },
    );
    expect(units).toHaveLength(2);
    expect(units[0].fraction).toBeUndefined();
    expect(units[1].fraction).toBeCloseTo(0.5);
  });

  it('emits a partial-fill cell for fractional accelerator shares', () => {
    const units = sessionGridUnits(
      {
        status: 'RUNNING',
        slots: { 'cuda.shares': '2.5' },
        liveStat: liveStatWithPct('cuda_util', '90'),
        kernels: [],
      },
      { ...baseOptions, resource: 'cuda.shares' },
    );
    expect(units).toHaveLength(3);
    expect(units[2].fraction).toBeCloseTo(0.5);
    expect(units.every((u) => u.color === 'error')).toBe(true);
  });

  it('does not emit a fraction cell for whole unit counts', () => {
    const units = sessionGridUnits(
      {
        status: 'RUNNING',
        slots: { 'cuda.shares': '2' },
        liveStat: {},
        kernels: [],
      },
      { ...baseOptions, resource: 'cuda.shares' },
    );
    expect(units).toHaveLength(2);
    expect(units.every((u) => u.fraction === undefined)).toBe(true);
  });

  it('truncates at maxUnits (default MAX_UNITS_PER_SESSION), dropping the fraction cell', () => {
    const units = sessionGridUnits(
      runningSession({ cpu: '1000.5' }),
      baseOptions,
    );
    expect(units).toHaveLength(MAX_UNITS_PER_SESSION);
    expect(units.every((u) => u.fraction === undefined)).toBe(true);
    expect(
      sessionGridUnits(runningSession({ cpu: '10' }), {
        ...baseOptions,
        maxUnits: 4,
      }),
    ).toHaveLength(4);
  });

  it('keeps room for the fraction cell under the cap', () => {
    const units = sessionGridUnits(runningSession({ cpu: '2.5' }), {
      ...baseOptions,
      maxUnits: 4,
    });
    expect(units).toHaveLength(3);
    expect(units[2].fraction).toBeCloseTo(0.5);
  });

  it('colors PENDING sessions (requested fallback, no live data) as no-data', () => {
    const { slots } = parseSlotMap('{}', JSON.stringify({ cpu: '2' }));
    const units = sessionGridUnits(
      { status: 'PENDING', slots, liveStat: {}, kernels: [] },
      baseOptions,
    );
    expect(units).toHaveLength(2);
    expect(units.every((u) => u.color === 'no-data')).toBe(true);
  });

  it('emits a single no-data cell when the slot is absent or zero', () => {
    expect(sessionGridUnits(runningSession({}), baseOptions)).toEqual([
      { color: 'no-data' },
    ]);
    expect(sessionGridUnits(runningSession({ cpu: '0' }), baseOptions)).toEqual(
      [{ color: 'no-data' }],
    );
  });
});

describe('sessionGridUnits — kernel mode', () => {
  const options = {
    mode: 'kernel' as const,
    resource: 'cpu',
    metric: 'cpu_util',
    memUnitGiB: 1,
    fills,
  };

  it('emits one unit per kernel, colored by the selected metric', () => {
    const units = sessionGridUnits(
      {
        status: 'RUNNING',
        slots: {},
        liveStat: {},
        kernels: [
          { status: 'RUNNING', liveStat: liveStatWithPct('cpu_util', '10') },
          { status: 'RUNNING', liveStat: liveStatWithPct('cpu_util', '65') },
          { status: 'RUNNING', liveStat: liveStatWithPct('cpu_util', '95') },
        ],
      },
      options,
    );
    expect(units.map((u) => u.color)).toEqual(['low', 'warn2', 'error']);
  });

  it('colors non-live kernels and kernels without the metric as no-data', () => {
    const units = sessionGridUnits(
      {
        status: 'RUNNING',
        slots: {},
        liveStat: {},
        kernels: [
          { status: 'PULLING', liveStat: liveStatWithPct('cpu_util', '10') },
          { status: 'RUNNING', liveStat: {} },
        ],
      },
      options,
    );
    expect(units.map((u) => u.color)).toEqual(['no-data', 'no-data']);
  });

  it('emits a single no-data cell for a session with no kernels', () => {
    expect(
      sessionGridUnits(
        { status: 'PENDING', slots: {}, liveStat: {}, kernels: [] },
        options,
      ),
    ).toEqual([{ color: 'no-data' }]);
  });

  it('truncates kernels at maxUnits', () => {
    const kernels = Array.from({ length: 10 }, () => ({
      status: 'RUNNING',
      liveStat: liveStatWithPct('cpu_util', '10'),
    }));
    expect(
      sessionGridUnits(
        { status: 'RUNNING', slots: {}, liveStat: {}, kernels },
        { ...options, maxUnits: 4 },
      ),
    ).toHaveLength(4);
  });
});

describe('control inventories', () => {
  it('lists cpu/mem first, then accelerator slots present in the data', () => {
    expect(
      availableResourceSlots([
        { slots: { cpu: '1', mem: '1' } },
        { slots: { 'cuda.shares': '2', cpu: '2' } },
      ]),
    ).toEqual(['cpu', 'mem', 'cuda.shares']);
  });

  it('sorts metrics: _util, mem, _mem, then the rest alphabetically', () => {
    const sessions = [
      {
        kernels: [
          {
            liveStat: {
              ...liveStatWithPct('io_read', '1'),
              ...liveStatWithPct('mem', '1'),
              ...liveStatWithPct('cuda_mem', '1'),
              ...liveStatWithPct('net_rx', '1'),
              ...liveStatWithPct('cpu_util', '1'),
              ...liveStatWithPct('cuda_util', '1'),
            },
          },
        ],
      },
    ];
    expect(availableLiveStatMetrics(sessions)).toEqual([
      'cpu_util',
      'cuda_util',
      'mem',
      'cuda_mem',
      'io_read',
      'net_rx',
    ]);
  });
});

describe('isNotYetAllocatedSession', () => {
  test('pre-running statuses are not-yet-allocated regardless of slot maps', () => {
    // Some managers mirror requested_slots into occupied_slots while
    // PENDING, so occupied-emptiness cannot decide.
    expect(isNotYetAllocatedSession('PENDING')).toBe(true);
    expect(isNotYetAllocatedSession('SCHEDULED')).toBe(true);
    expect(isNotYetAllocatedSession('PREPARING')).toBe(true);
  });

  test('running and released sessions are not marked', () => {
    expect(isNotYetAllocatedSession('RUNNING')).toBe(false);
    // Terminated sessions ALSO have an empty occupied_slots (released) —
    // the reason the predicate must not fall back on slot emptiness.
    expect(isNotYetAllocatedSession('TERMINATED')).toBe(false);
    expect(isNotYetAllocatedSession('CANCELLED')).toBe(false);
  });
});

describe('resource-mode util/mem dimensions', () => {
  test('parseResourceValue decodes slot and dimension', () => {
    expect(parseResourceValue('cpu')).toEqual({
      slot: 'cpu',
      dimension: 'util',
    });
    expect(parseResourceValue('cuda.shares')).toEqual({
      slot: 'cuda.shares',
      dimension: 'util',
    });
    expect(parseResourceValue('cuda.shares:mem')).toEqual({
      slot: 'cuda.shares',
      dimension: 'mem',
    });
  });

  test('parseResourceValue keeps MIG subtype colons inside the slot', () => {
    expect(parseResourceValue('cuda.device:1g.20gb-mig')).toEqual({
      slot: 'cuda.device:1g.20gb-mig',
      dimension: 'util',
    });
    expect(parseResourceValue('cuda.device:1g.20gb-mig:mem')).toEqual({
      slot: 'cuda.device:1g.20gb-mig',
      dimension: 'mem',
    });
  });

  test('memKeyForSlot maps accelerator slots to their memory stat key', () => {
    expect(memKeyForSlot('cuda.shares')).toBe('cuda_mem');
    expect(memKeyForSlot('hyperaccel-lpu.device')).toBe('hyperaccel_lpu_mem');
  });

  test('availableResourceOptions splits accelerators that report a mem stat', () => {
    const sessions = [
      {
        slots: { cpu: '2', mem: `${GiB}`, 'cuda.shares': '1' },
        liveStat: {
          cuda_util: { pct: '10' },
          cuda_mem: { pct: '55' },
        } as SessionLiveStats,
      },
    ];
    expect(availableResourceOptions(sessions)).toEqual([
      'cpu',
      'mem',
      'cuda.shares',
      'cuda.shares:mem',
    ]);
  });

  test('availableResourceOptions keeps a single entry without a mem stat', () => {
    const sessions = [
      {
        slots: { cpu: '2', 'cuda.shares': '1' },
        liveStat: { cuda_util: { pct: '10' } } as SessionLiveStats,
      },
    ];
    expect(availableResourceOptions(sessions)).toEqual([
      'cpu',
      'mem',
      'cuda.shares',
    ]);
  });

  test('sessionHasResource is true only when the slot is held', () => {
    const slots = { cpu: '2', 'cuda.shares': '0.5' };
    expect(sessionHasResource(slots, 'cpu')).toBe(true);
    expect(sessionHasResource(slots, 'cuda.shares')).toBe(true);
    expect(sessionHasResource(slots, 'cuda.shares:mem')).toBe(true);
    expect(sessionHasResource({ cpu: '2' }, 'cuda.shares')).toBe(false);
    expect(sessionHasResource({ 'cuda.shares': '0' }, 'cuda.shares')).toBe(
      false,
    );
  });

  test('sessionUtilizationPct reads the mem stat for a :mem selection', () => {
    const liveStat = {
      cuda_util: { pct: '10' },
      cuda_mem: { pct: '85' },
    } as SessionLiveStats;
    expect(sessionUtilizationPct('RUNNING', liveStat, 'cuda.shares')).toBe(10);
    expect(sessionUtilizationPct('RUNNING', liveStat, 'cuda.shares:mem')).toBe(
      85,
    );
  });

  test('sessionGridUnits sizes a :mem selection by device-memory GiB, colors by the mem stat', () => {
    const fills: UtilizationFills = {
      bins: ['b0', 'b1', 'b2', 'b3', 'b4'],
      noData: 'nd',
    };
    const session = {
      status: 'RUNNING',
      slots: { 'cuda.shares': '2.5' },
      liveStat: {
        cuda_util: { pct: '10' },
        cuda_mem: { pct: '85', capacity: `${5 * GiB}` },
      } as SessionLiveStats,
      kernels: [],
    };
    const oneGiB = sessionGridUnits(session, {
      mode: 'resource',
      resource: 'cuda.shares:mem',
      metric: '',
      memUnitGiB: 1,
      fills,
    });
    // 5 GiB of device memory at 1 GiB/unit, colored by cuda_mem (85% → bin 4).
    expect(oneGiB).toHaveLength(5);
    expect(oneGiB.every((c) => c.color === 'b4')).toBe(true);
    const twoGiB = sessionGridUnits(session, {
      mode: 'resource',
      resource: 'cuda.shares:mem',
      metric: '',
      memUnitGiB: 2,
      fills,
    });
    expect(twoGiB).toHaveLength(3);
    expect(twoGiB[2].fraction).toBeCloseTo(0.5);
  });

  test('sessionGridUnits falls back to one no-data cell without a device-memory capacity', () => {
    const fills: UtilizationFills = {
      bins: ['b0', 'b1', 'b2', 'b3', 'b4'],
      noData: 'nd',
    };
    const cells = sessionGridUnits(
      {
        status: 'PENDING',
        slots: { 'cuda.shares': '2' },
        liveStat: {} as SessionLiveStats,
        kernels: [],
      },
      {
        mode: 'resource',
        resource: 'cuda.shares:mem',
        metric: '',
        memUnitGiB: 1,
        fills,
      },
    );
    expect(cells).toEqual([{ color: 'nd' }]);
  });
});
