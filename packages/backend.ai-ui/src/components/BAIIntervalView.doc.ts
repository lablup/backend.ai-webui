import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIIntervalView',
  displayName: 'BAI Interval View',
  category: 'Utility',
  keywords: [
    'interval',
    'timer',
    'ticker',
    'elapsed',
    'countdown',
    'live value',
    'polling',
  ],
  usage: {
    description:
      'A renderless ticker: it calls `callback` every `delay` milliseconds and renders the value it returns, so an elapsed time, a countdown or a relative timestamp stays current without the surrounding component re-rendering. It wraps the `useIntervalValue` hook, which only commits a new value when the result differs from the previous one and pauses the interval while the browser tab is hidden. Passing `null` as `delay` freezes it, and changing `triggerKey` recomputes immediately without waiting for the next tick.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Return a primitive from `callback` — the value is compared by identity, so a fresh object or array re-renders on every tick.',
      },
      {
        guidance: true,
        description:
          'Keep `delay` as coarse as the display needs: one second for an elapsed clock, minutes for a relative timestamp.',
      },
      {
        guidance: true,
        description:
          'Place it around the smallest piece of text that changes, so a table row or card is not re-rendered every second.',
      },
      {
        guidance: true,
        description:
          'Set `delay` to `null` once the underlying value stops moving — a terminated session no longer needs a running clock.',
      },
      {
        guidance: false,
        description:
          'Fetch inside `callback`; it runs on a bare timer with no loading, error or in-flight handling. Use BAIFetchKeyButton with an auto-update delay to drive refetches.',
      },
    ],
  },
  props: [
    {
      name: 'callback',
      type: '() => T',
      description:
        'Computes the value on each tick. Its result is rendered directly when `render` is omitted.',
      required: true,
    },
    {
      name: 'delay',
      type: 'number | null',
      description:
        'Milliseconds between ticks. `null` clears the interval and holds the last computed value.',
      required: true,
    },
    {
      name: 'render',
      type: '(data: T) => React.ReactNode',
      description:
        'Wraps the computed value in markup. Without it the raw value is rendered as-is.',
    },
    {
      name: 'triggerKey',
      type: 'string',
      description:
        'Recomputes the value immediately when this string changes to a TRUTHY value, in addition to the regular ticks. Changing it to an empty string records the new key but skips the recomputation, so it is not a way to force a refresh.',
    },
  ],
  examples: [
    {
      label: 'Elapsed session time',
      code: `<BAIIntervalView
  key={session.id}
  callback={() => {
    const begin = session?.starts_at || session?.created_at;
    return begin && dayjs(begin).isBefore()
      ? formatDurationAsDays(begin, session?.terminated_at)
      : '-';
  }}
  delay={1000}
  render={(elapsed) => <BAIText monospace>{elapsed}</BAIText>}
/>`,
    },
    {
      label: 'Relative timestamp, refreshed on demand',
      code: `<BAIIntervalView
  callback={() => dayjs(lastUpdatedAt).fromNow()}
  delay={60_000}
  triggerKey={fetchKey}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
