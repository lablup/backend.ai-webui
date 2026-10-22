import { formatCompactDuration, parseTimedelta } from './duration';

describe('parseTimedelta', () => {
  test.each([
    ['0:00:00', 0],
    ['0:00:00.123456', 123],
    ['0:00:00.000400', 0],
    ['0:00:01.234567', 1235],
    ['0:00:05', 5000],
    ['0:01:00', 60_000],
    ['1:02:03', 3_723_000],
    [' 0:00:05 ', 5000],
    ['1 day, 2:03:04.5', 93_784_500],
    ['3 days, 0:00:00', 259_200_000],
  ])('parses %s as %d ms', (value, expected) => {
    expect(parseTimedelta(value)).toBe(expected);
  });

  test.each(['5s', 'PT5S', '-1 day, 23:59:59', 'unknown', '1:2:3'])(
    'returns null for %s',
    (value) => {
      expect(parseTimedelta(value)).toBeNull();
    },
  );
});

describe('formatCompactDuration', () => {
  test.each([
    [0, '0 ms'],
    [999, '999 ms'],
    [1000, '1 s'],
    [1234, '1.23 s'],
    [59_999, '59.99 s'],
    [60_000, '1m'],
    [90_061_000, '1d 1h 1m 1s'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatCompactDuration(ms)).toBe(expected);
  });
});

describe('parseTimedelta + formatCompactDuration', () => {
  test.each([
    ['0:00:00', '0 ms'],
    ['0:00:00.123456', '123 ms'],
    ['0:00:00.000400', '0 ms'],
    ['0:00:00.999600', '1 s'],
    ['0:00:01.234567', '1.23 s'],
    ['0:00:01.200000', '1.2 s'],
    ['0:00:05', '5 s'],
    ['0:00:59.999999', '1m'],
    ['0:00:59.99', '59.99 s'],
    ['0:01:00', '1m'],
    ['0:02:05.700000', '2m 5s'],
    ['1:02:03', '1h 2m 3s'],
    ['10:00:00', '10h'],
    ['1 day, 2:03:04.5', '1d 2h 3m 4s'],
    ['3 days, 0:00:00', '3d'],
    ['2 days, 0:00:07', '2d 7s'],
  ])('formats %s as %s', (value, expected) => {
    const ms = parseTimedelta(value);
    expect(ms === null ? value : formatCompactDuration(ms)).toBe(expected);
  });
});
