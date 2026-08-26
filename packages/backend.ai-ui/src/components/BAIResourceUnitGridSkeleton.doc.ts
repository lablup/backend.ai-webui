import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIResourceUnitGridSkeleton',
  displayName: 'BAI Resource Unit Grid Skeleton',
  category: 'Feedback & Status',
  keywords: [
    'skeleton',
    'placeholder',
    'loading',
    'shimmer',
    'suspense fallback',
    'unit grid',
    'ghost',
  ],
  hidden: true,
  usage: {
    description:
      'The Suspense fallback for BAIResourceUnitGrid. It lays out Astryx Skeleton boxes in the three bands the real grid occupies — a toolbar row, a wrapped legend row, and the lattice — inside BAIFlex rows. The lattice stand-in is deliberately low fidelity, two wide blocks per row rather than per-session plates and cells, because a faithful lattice reads as data that is not there yet. Every box shares one running index, so the shimmer sweeps the whole block as a single wave instead of restarting per row. The rest of the props type is React.HTMLAttributes<HTMLDivElement> minus children, so style and the usual DOM attributes pass through to the wrapper.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give the Suspense boundary a key built from the filter and order that drive the grid, so a change swaps to this fallback immediately rather than holding the stale grid until the refetch commits.',
      },
      {
        guidance: true,
        description:
          'Leave rows at its default unless the surrounding layout has a known height to fill; a stand-in taller than the real grid makes the page jump when the data arrives.',
      },
      {
        guidance: false,
        description:
          'Reaching for it as a generic loading placeholder — BAISkeleton covers that, and this one paints a toolbar and a legend that only the resource unit grid has.',
      },
      {
        guidance: false,
        description:
          'Passing a negative rows value expecting a compact variant; it is clamped to zero and simply drops the lattice band, leaving the toolbar and legend alone.',
      },
    ],
  },
  props: [
    {
      name: 'rows',
      type: 'number',
      description:
        'How many lattice stand-in rows to draw. Each row is two blocks whose widths cycle a fixed three-row pattern, so consecutive rows do not line up. Clamped at zero.',
      default: '3',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Extra classes on the wrapper. Appended to the components own bai-resource-unit-grid-skeleton class rather than replacing it.',
    },
  ],
  examples: [
    {
      label: 'Suspense fallback for the session resource grid',
      code: `<Suspense
  key={\`\${gridFilter ?? ''}:\${queryVariables.order ?? ''}\`}
  fallback={<BAIResourceUnitGridSkeleton />}
>
  <SessionResourceGrid filter={gridFilter} fetchKey={deferredFetchKey} />
</Suspense>`,
    },
    {
      label: 'Taller stand-in for a fixed-height panel',
      code: '<BAIResourceUnitGridSkeleton rows={6} />',
    },
  ],
} satisfies ComponentDoc;

export default docs;
