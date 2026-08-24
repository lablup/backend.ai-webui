import { formatElapsed, isResultMarkerEntry } from './BAISubStepNodes';

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

  test('a missing or inverted timestamp yields no duration', () => {
    expect(formatElapsed(null, '2026-08-24T16:19:03.940Z')).toBeNull();
    expect(formatElapsed('2026-08-24T16:19:03.940Z', undefined)).toBeNull();
    expect(
      formatElapsed('2026-08-24T16:19:05.031Z', '2026-08-24T16:19:03.940Z'),
    ).toBeNull();
  });
});

describe('isResultMarkerEntry', () => {
  const zeroLength = {
    startedAt: '2026-08-24T16:19:05.031Z',
    endedAt: '2026-08-24T16:19:05.031Z',
  };
  const realStep = {
    startedAt: '2026-08-24T16:19:03.912Z',
    endedAt: '2026-08-24T16:19:03.940Z',
  };

  test('the trailing zero-length entry is the lifecycle marker', () => {
    expect(isResultMarkerEntry(zeroLength, 2, 3)).toBe(true);
  });

  test('an interior zero-length entry is a real (fast) step', () => {
    expect(isResultMarkerEntry(zeroLength, 1, 3)).toBe(false);
  });

  test('a trailing entry that took time is a real step', () => {
    expect(isResultMarkerEntry(realStep, 2, 3)).toBe(false);
  });

  test('missing timestamps never make a marker', () => {
    expect(isResultMarkerEntry({ startedAt: null, endedAt: null }, 0, 1)).toBe(
      false,
    );
  });
});
