import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIFetchKeyButton',
  displayName: 'BAI Fetch Key Button',
  category: 'Action',
  keywords: [
    'refresh',
    'reload',
    'refetch',
    'fetch key',
    'auto refresh',
    'polling',
    'interval',
  ],
  usage: {
    description:
      'The refresh control for any data surface. It renders a BAIButton with a rotate icon and, on each click, calls `onChange` with a fresh ISO timestamp — the fetch key a Relay query or refetch reads to reload. It can also refresh on a timer: wiring `onChangeAutoUpdateDelay` turns the control into an Astryx ButtonGroup whose second half is a DropdownMenu of interval presets (plus "Off"), and while an interval is active a BAICountdownBorder fills around the control once per cycle. Manual clicks, interval changes and finished loads all re-anchor that countdown, so the animation never runs ahead of the real reload. Remaining props pass through to BAIButton.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Place it in the `extra` slot of the BAICard whose content it reloads, so a card has exactly one refresh affordance.',
      },
      {
        guidance: true,
        description:
          'Feed `loading` from the refetch transition — the icon spins for at least 700ms so a fast reload still reads as a refresh, and auto-refresh pauses while a load is in flight.',
      },
      {
        guidance: true,
        description:
          'Persist the chosen interval by pairing `autoUpdateDelay` with `onChangeAutoUpdateDelay` (the host-side AutoUpdateFetchKeyButton stores it in user settings) instead of hardcoding a delay.',
      },
      {
        guidance: true,
        description:
          'Leave `pauseWhenHidden` on so auto-refresh stops issuing requests once the browser tab moves to the background.',
      },
      {
        guidance: false,
        description:
          'Include `null` in `autoUpdateDelayOptions` — "Off" is prepended by the component and a null entry would duplicate it.',
      },
      {
        guidance: false,
        description:
          'Thread a fetch key through `value` when nothing reads it; the button generates its own key and `onChange` alone is enough.',
      },
    ],
  },
  props: [
    {
      name: 'onChange',
      type: '(fetchKey: string) => void',
      description:
        'Called with a new ISO timestamp on every refresh, manual or automatic. Trigger the refetch here.',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Current fetch key. Optional and unread by the component — it generates its own key — so consumers that refetch directly inside `onChange` can omit it.',
    },
    {
      name: 'loading',
      type: 'boolean',
      description:
        'Whether a load is in flight. Drives the spinner (held for at least 700ms), pauses auto-refresh, and freezes the countdown border until the load finishes.',
    },
    {
      name: 'lastLoadTime',
      type: 'Date',
      description:
        'Timestamp of the last successful load. Left unset, the component records it itself on each load-to-idle transition.',
    },
    {
      name: 'showLastLoadTime',
      type: 'boolean',
      description:
        'Replaces the "Refresh" tooltip with a relative "Last updated: …" message that re-renders every 5 seconds.',
    },
    {
      name: 'autoUpdateDelay',
      type: 'number | null',
      description:
        'Auto-refresh interval in milliseconds; `null` means off. Controllable — pass it together with `onChangeAutoUpdateDelay` to let the host own and persist the value.',
    },
    {
      name: 'onChangeAutoUpdateDelay',
      type: '(delayMs: number | null) => void',
      description:
        'Called when the user picks an interval or "Off". Providing it is what opts the button into the interval dropdown; without it the control is a single refresh button.',
    },
    {
      name: 'autoUpdateDelayOptions',
      type: 'readonly number[]',
      description:
        'Interval presets shown in the dropdown, in milliseconds. An active value outside this list stays selectable for the lifetime of the component instead of disappearing.',
      default: '[5000, 10000, 15000, 30000, 60000]',
    },
    {
      name: 'showCountdownBorder',
      type: 'boolean',
      description:
        'Whether the animated border fills around the control while auto-refresh is on. Set it to `false` where the animation would compete with nearby motion.',
      default: 'true',
    },
    {
      name: 'pauseWhenHidden',
      type: 'boolean',
      description:
        'Suspends auto-refresh and the "last updated" ticker while the document is hidden.',
      default: 'true',
    },
    {
      name: 'hidden',
      type: 'boolean',
      description:
        'Renders nothing. Auto-refresh stops with it, since the whole component unmounts its timers.',
    },
    {
      name: 'size',
      type: "'small' | 'middle' | 'large'",
      description:
        'Button size, mapped onto the Astryx sm/md/lg scale and applied to the dropdown trigger too.',
    },
  ],
  examples: [
    {
      label: 'Manual refresh',
      code: `<BAIFetchKeyButton
  loading={isPendingRefetch}
  value={fetchKey}
  onChange={updateFetchKey}
/>`,
    },
    {
      label: 'With the auto-refresh interval dropdown',
      code: `<BAIFetchKeyButton
  loading={isPendingRefetch}
  showLastLoadTime
  onChange={updateFetchKey}
  autoUpdateDelay={autoUpdateDelay}
  onChangeAutoUpdateDelay={setAutoUpdateDelay}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
