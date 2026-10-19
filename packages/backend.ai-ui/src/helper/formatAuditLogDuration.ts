const TIMEDELTA_PATTERN = /^(?:(\d+) days?, )?(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/;

export const formatAuditLogDuration = (value: string): string => {
  const match = TIMEDELTA_PATTERN.exec(value.trim());
  if (!match) {
    return value;
  }
  const [, days = '0', hours, minutes, seconds] = match;
  const totalMs = Math.round(
    ((Number(days) * 24 + Number(hours)) * 60 + Number(minutes)) * 60_000 +
      Number(seconds) * 1000,
  );
  if (totalMs < 1000) {
    return `${totalMs} ms`;
  }
  if (totalMs < 60_000) {
    return `${Math.floor(totalMs / 10) / 100} s`;
  }
  const totalSeconds = Math.floor(totalMs / 1000);
  const parts: Array<[number, string]> = [
    [Math.floor(totalSeconds / 86_400), 'd'],
    [Math.floor(totalSeconds / 3600) % 24, 'h'],
    [Math.floor(totalSeconds / 60) % 60, 'm'],
    [totalSeconds % 60, 's'],
  ];
  return parts
    .filter(([amount]) => amount > 0)
    .map(([amount, unit]) => `${amount}${unit}`)
    .join(' ');
};
