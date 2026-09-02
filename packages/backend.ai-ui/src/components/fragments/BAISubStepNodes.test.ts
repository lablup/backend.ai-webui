import {
  countExecutedSubSteps,
  formatElapsed,
  isLifecycleMarkerEntry,
} from './BAISubStepNodes';

describe('formatElapsed', () => {
  test('sub-second intervals read in milliseconds', () => {
    expect(
      formatElapsed('2026-08-24T16:19:03.912Z', '2026-08-24T16:19:03.940Z'),
    ).toBe('28 ms');
  });

  test('seconds keep two sub-second digits', () => {
    expect(
      formatElapsed('2026-08-24T16:19:03.940Z', '2026-08-24T16:19:05.031Z'),
    ).toBe('1.09 s');
    expect(
      formatElapsed('2026-08-24T16:19:03.000Z', '2026-08-24T16:19:07.300Z'),
    ).toBe('4.30 s');
  });

  test('a minute or more switches to m/s, an hour or more to h/m', () => {
    expect(
      formatElapsed('2026-08-24T16:19:00.000Z', '2026-08-24T16:20:05.000Z'),
    ).toBe('1m 05s');
    expect(
      formatElapsed('2026-08-24T16:00:00.000Z', '2026-08-24T18:07:00.000Z'),
    ).toBe('2h 07m');
  });

  test('a zero-length interval is a real duration, not a missing one', () => {
    expect(
      formatElapsed('2026-08-19T09:32:55.524Z', '2026-08-19T09:32:55.524Z'),
    ).toBe('0 ms');
  });

  test('a missing or inverted timestamp yields no duration', () => {
    expect(formatElapsed(null, '2026-08-24T16:19:03.940Z')).toBeNull();
    expect(formatElapsed('2026-08-24T16:19:03.940Z', undefined)).toBeNull();
    expect(
      formatElapsed('2026-08-24T16:19:05.031Z', '2026-08-24T16:19:03.940Z'),
    ).toBeNull();
  });
});

describe('isLifecycleMarkerEntry', () => {
  const PHASE = 'deploying-rolling-back';

  test('the trailing entry that restates the row phase is the marker', () => {
    // The coordinator writes the phase with dashes and the sub-step with
    // underscores; they name the same thing.
    expect(
      isLifecycleMarkerEntry({ step: 'deploying_rolling_back' }, 2, 3, PHASE),
    ).toBe(true);
  });

  test('the same name in an interior position is not the marker', () => {
    expect(
      isLifecycleMarkerEntry({ step: 'deploying_rolling_back' }, 1, 3, PHASE),
    ).toBe(false);
  });

  test('a trailing recorder step is not the marker', () => {
    expect(
      isLifecycleMarkerEntry({ step: 'setup_target_groups' }, 2, 3, PHASE),
    ).toBe(false);
  });

  test('without the row phase nothing is a marker', () => {
    expect(
      isLifecycleMarkerEntry({ step: 'deploying_rolling_back' }, 0, 1, null),
    ).toBe(false);
  });

  test('session rows never produce a marker', () => {
    // Sessions and routes go through `extract_sub_steps_for_entity`, which
    // appends nothing — and a real session step can still take 0 ms, which is
    // why elapsed time cannot be the test.
    expect(
      isLifecycleMarkerEntry(
        { step: 'All kernels ready for PREPARED' },
        1,
        2,
        'schedule-sessions',
      ),
    ).toBe(false);
  });
});

describe('countExecutedSubSteps', () => {
  const PHASE = 'deploying-rolling-back';

  test('a lone lifecycle marker counts as no detail to expand', () => {
    expect(
      countExecutedSubSteps([{ step: 'deploying_rolling_back' }], PHASE),
    ).toBe(0);
  });

  test('real steps count, the trailing marker does not', () => {
    expect(
      countExecutedSubSteps(
        [
          { step: 'resolve_rollout_target' },
          { step: 'setup_target_groups' },
          { step: 'deploying_rolling_back' },
        ],
        PHASE,
      ),
    ).toBe(2);
  });

  test('every session sub-step counts', () => {
    expect(
      countExecutedSubSteps(
        [{ step: 'check_and_pull_images' }, { step: 'All kernels ready' }],
        'schedule-sessions',
      ),
    ).toBe(2);
  });

  test('an empty list has nothing to expand', () => {
    expect(countExecutedSubSteps([], PHASE)).toBe(0);
    expect(countExecutedSubSteps([null, undefined], PHASE)).toBe(0);
  });
});
