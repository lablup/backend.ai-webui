import { formatAuditLogDuration } from './formatAuditLogDuration';

describe('formatAuditLogDuration', () => {
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
    expect(formatAuditLogDuration(value)).toBe(expected);
  });

  test.each(['5s', 'PT5S', '-1 day, 23:59:59', 'unknown', '1:2:3'])(
    'returns the unparseable value %s as is',
    (value) => {
      expect(formatAuditLogDuration(value)).toBe(value);
    },
  );
});
