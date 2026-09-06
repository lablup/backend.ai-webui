import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAICountdownBorder',
  displayName: 'BAI Countdown Border',
  category: 'Feedback & Status',
  hidden: true,
  keywords: [
    'countdown',
    'progress border',
    'border beam',
    'timer',
    'auto refresh',
    'progress ring',
  ],
  usage: {
    description:
      'Wraps its children in a rounded-rect outline that fills clockwise over durationMs and restarts each cycle — a countdown rendered as a border rather than a bar. The wrapper measures its own box with a ResizeObserver and draws an SVG rect on top, stroke centred on the content edge so it hugs the child and stays visible over an opaque surface; the fill is a CSS dash animation that respects prefers-reduced-motion. It is the auto-refresh countdown around BAIFetchKeyButton, which is why the animation can be steered from outside: resetKey restarts the fill on the render it changes, and paused freezes and hides it while a load is in flight, so the visible countdown never runs ahead of the refresh it represents.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Feed resetKey the same trigger that causes the real work (a fetch-key bump), so a mid-cycle manual action restarts the fill instead of leaving it on a stale schedule.',
      },
      {
        guidance: true,
        description:
          'Set paused while the awaited operation is running, so no countdown is shown for time the user is already waiting through.',
      },
      {
        guidance: true,
        description:
          'Set the border colour through style.stroke with an Astryx colour variable, which follows the accent of whichever theme subtree the border renders in.',
      },
      {
        guidance: false,
        description:
          'Wrap a control whose own timing is unknown — a border that fills against nothing reads as a promise the surface does not keep.',
      },
      {
        guidance: false,
        description:
          'Override position in style; the wrapper pins position: relative last because the SVG overlay is absolutely positioned inside it.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'Content to wrap. The border is drawn around its measured box, and the wrapper is an inline-flex element so it hugs the child.',
    },
    {
      name: 'durationMs',
      type: 'number',
      description:
        'Length of one full clockwise fill cycle, in milliseconds. Applied as the CSS animation duration.',
      required: true,
    },
    {
      name: 'animated',
      type: 'boolean',
      description:
        'Whether the fill runs. When false no border is drawn at all, leaving the children on their own.',
      default: 'true',
    },
    {
      name: 'paused',
      type: 'boolean',
      description:
        'Freezes the animation and hides the border entirely, instead of letting a stale countdown advance. Used while the wrapped control is busy.',
      default: 'false',
    },
    {
      name: 'resetKey',
      type: 'React.Key',
      description:
        'Changing it remounts the rect, restarting the fill from empty on that render rather than waiting for the current cycle to end.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the wrapper element.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        "Style for the wrapper, and the border's own appearance: stroke sets the colour (default var(--color-accent)), strokeWidth the thickness (default 1.5) and borderRadius the corner radius (default the borderRadius token). The rest passes to the wrapper.",
    },
  ],
  examples: [
    {
      label: 'Countdown around an auto-refreshing control',
      code: `<BAICountdownBorder
  durationMs={autoUpdateDelay}
  resetKey={cycleKey}
  paused={loading}
>
  <RefreshButton />
</BAICountdownBorder>`,
    },
    {
      label: 'Custom stroke colour',
      code: `<BAICountdownBorder durationMs={5000} style={{ stroke: 'var(--color-error)' }}>
  <SomeControl />
</BAICountdownBorder>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
