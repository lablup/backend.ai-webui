const TIMEDELTA_PATTERN = /^(?:(\d+) days?, )?(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/;

export const parseTimedelta = (value: string): number | null => {
  const match = TIMEDELTA_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const [, days = '0', hours, minutes, seconds] = match;
  return Math.round(
    ((Number(days) * 24 + Number(hours)) * 60 + Number(minutes)) * 60_000 +
      Number(seconds) * 1000,
  );
};

export const formatCompactDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  if (ms < 60_000) {
    return `${Math.floor(ms / 10) / 100} s`;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const parts: Array<[number, string]> = [
    [Math.floor(totalSeconds / 86_400), 'd'],
    [Math.floor(totalSeconds / 3600) % 24, 'h'],
    [Math.floor(totalSeconds / 60) % 60, 'min'],
    [totalSeconds % 60, 's'],
  ];
  return parts
    .filter(([amount]) => amount > 0)
    .map(([amount, unit]) => `${amount} ${unit}`)
    .join(' ');
};
