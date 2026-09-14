import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProgressRing',
  displayName: 'BAI Progress Ring',
  category: 'Feedback & Status',
  keywords: [
    'progress',
    'ring',
    'spinner',
    'loading',
    'determinate',
    'indeterminate',
    'icon',
  ],
  usage: {
    description:
      'A progress ring small enough to be an icon. Astryx has a Spinner, which is always indeterminate, and a ProgressBar, which is a full-width horizontal bar — neither fits the `icon` slot of a Badge, which is where a session status has to show how far along it is. This draws a two-circle SVG in a 16-unit box: a track at 25% opacity and an arc whose dash offset carries `percent`, both stroked with `currentColor` so the ring takes the colour of the badge variant around it, and sized `1em` so it scales with the text. Without a `percent` it falls back to a short arc spinning at the same 1s as the `.bai-icon-spin` glyph it replaces, so a value that is not known yet looks exactly like the old spinner. The determinate ring also keeps turning slowly (2.4s per turn) so it still reads as "in progress" between two updates that may be minutes apart. For that rotation to be perceptible the arc has to have two ends, so the DRAWN arc is pinned to 8..86% (`BAI_PROGRESS_RING_MIN_VISIBLE_PERCENT` / `BAI_PROGRESS_RING_MAX_VISIBLE_PERCENT`) — never a bare track, never a closed circle, and never so long that the round line caps swallow the gap. Only the extremes are pinned; 50% still draws half, and `aria-valuenow` always carries the true percent.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Hand it to a Badge `icon` slot and leave the label alone — the ring carries the progress, the label carries the status word.',
      },
      {
        guidance: true,
        description:
          'Pass `undefined` rather than `0` when the value is unknown; the indeterminate ring says "working on it", a 0% ring says "nothing has happened".',
      },
      {
        guidance: true,
        description:
          'Put the exact `done / total` in a tooltip or popover on the surrounding element — the ring is a glance, not a readout.',
      },
      {
        guidance: false,
        description:
          'Use it as a page or panel loading indicator; that is Astryx `Spinner`, which has sizes, shades and a label slot.',
      },
      {
        guidance: false,
        description:
          'Use it to show a completed or failed state — a settled status has no progress, so render the badge with no icon at all.',
      },
      {
        guidance: false,
        description:
          'Set an explicit colour on it; the stroke is `currentColor` by design, so recolour the element that carries the ring.',
      },
    ],
  },
  props: [
    {
      name: 'percent',
      type: 'number',
      description:
        'Completion in percent, clamped to 0..100. Omitted, or non-finite, renders the indeterminate ring. The reported value is the true one; the drawn arc is additionally pinned to 8..86% so it never reaches empty or full and the slow rotation stays perceptible.',
    },
    {
      name: 'size',
      type: 'string | number',
      description:
        'Rendered size of the square the ring is drawn in. The default follows the font size, so the ring lines up with the text beside it.',
      default: "'1em'",
    },
    {
      name: 'strokeWidth',
      type: 'number',
      description:
        'Stroke width of both circles, in user units of the 16-unit viewBox. The radius follows it, so the stroke stays inside the box.',
      default: '2',
    },
    {
      name: 'rotate',
      type: 'boolean',
      description:
        'Whether the determinate ring keeps turning slowly (2.4s per turn). The indeterminate ring always spins, since the spin is all it has to say.',
      default: 'true',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Accessible name. A determinate ring is a `progressbar` with `aria-valuenow` whether or not it is named; an indeterminate one is decorative (`aria-hidden`) until this names it.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Extra class on the svg, appended to the internal `bai-progress-ring` classes.',
    },
  ],
  examples: [
    {
      label: 'Kernel progress in a session status badge',
      code: `<Badge
  variant={badgeVariantForStatus('session', session.status)}
  icon={<BAIProgressRing percent={progress.percent} />}
  label={session.status}
/>`,
    },
    {
      label: 'Indeterminate, for a single-node session',
      code: `<Badge variant="warning" icon={<BAIProgressRing />} label="TERMINATING" />`,
    },
    {
      label: 'The extremes still spin — a short arc at 0, an open one at 100',
      code: `<BAIProgressRing percent={0} />
<BAIProgressRing percent={100} />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
