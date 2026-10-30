import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIResourceAreaGrid',
  displayName: 'BAI Resource Area Grid',
  category: 'Form Controls',
  keywords: [
    'resource',
    'allocation',
    'grid',
    'cells',
    'drag',
    'area',
    'rectangle',
    'amount picker',
  ],
  usage: {
    description:
      'An amount picker drawn as a grid of cells: the user drags a rectangle from the top-left cell, and the selected amount is rows × columns cells. Cells past `availableCells` (counted in reading order) are hatched and cannot be part of the rectangle, and the rectangle never covers fewer than `minCells`. The value is a plain cell count, so the caller owns the unit each cell stands for (one core, 1 GiB, 0.5 fGPU). A count no rectangle expresses — a prime larger than `columns` — shows the largest rectangle below it, so pair the grid with a number input that holds the exact value. The wrapper is a `role="slider"`: arrow keys grow or shrink by one column or row, Home and End jump to the minimum and to the largest rectangle. Used by the quick-create session modal.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give it an `aria-label` that names the resource; the cells are decorative and the slider carries the value.',
      },
      {
        guidance: true,
        description:
          'Show the exact amount next to the grid (and accept it in a number input) — the rectangle alone cannot express every count.',
      },
      {
        guidance: false,
        description:
          'Draw thousands of cells; switch the unit a cell stands for instead, so a card stays within a few dozen cells.',
      },
    ],
  },
  props: [
    {
      name: 'columns',
      type: 'number',
      description: 'Cells per row.',
      required: true,
    },
    {
      name: 'totalCells',
      type: 'number',
      description: 'Cells drawn, available or not.',
      required: true,
    },
    {
      name: 'availableCells',
      type: 'number',
      description:
        'Cells that can be selected, counted in reading order; the rest are hatched.',
      default: 'totalCells',
    },
    {
      name: 'minCells',
      type: 'number',
      description: 'The selection never covers fewer cells than this.',
      default: '0',
    },
    {
      name: 'value',
      type: 'number',
      description: 'The selected cell count.',
      default: '0',
    },
    {
      name: 'onChange',
      type: '(count: number) => void',
      description:
        'Called with the new cell count while dragging and on key presses.',
    },
    {
      name: 'color',
      type: 'string',
      description: 'Fill of the selected cells, a CSS colour or `var()` token.',
      default: "'var(--color-accent)'",
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Ignores pointer and keyboard input and dims the grid.',
    },
  ],
  examples: [
    {
      label: 'CPU cores, 8 per row',
      code: `<BAIResourceAreaGrid
  aria-label="CPU"
  columns={8}
  totalCells={16}
  availableCells={12}
  minCells={1}
  value={cores}
  onChange={setCores}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
