import { buildTokens } from '../theme-shim';
import BAIFlex from './BAIFlex';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

/**
 * The spacing custom properties as Astryx's stylesheet declares them, read
 * from the file the app loads (`@lablup/ui-common/astryx.css` imports core's).
 * jsdom applies no stylesheet, so this is what a browser resolves
 * `var(--spacing-N)` to.
 */
const astryxSpacing = (() => {
  const require = createRequire(import.meta.url);
  const mirror = require.resolve('@lablup/ui-common/astryx.css');
  const target = /@import "([^"]+)"/.exec(readFileSync(mirror, 'utf8'))![1];
  const css = readFileSync(
    createRequire(resolve(dirname(mirror), 'x.js')).resolve(target),
    'utf8',
  );
  const vars = new Map<string, number>();
  for (const [, name, value] of css.matchAll(
    /(--spacing-[\d-]+):\s*([\d.]+)px/g,
  )) {
    if (vars.has(name) && vars.get(name) !== Number(value)) {
      throw new Error(`${name} is declared with two values`);
    }
    vars.set(name, Number(value));
  }
  return vars;
})();

/** A gap declaration as a browser computes it, one or two lengths. */
const toPx = (gap: string) =>
  gap
    .split(' ')
    .map((part) => {
      const v = /^var\((--[\w-]+)\)$/.exec(part);
      if (v) {
        const px = astryxSpacing.get(v[1]);
        if (px === undefined) throw new Error(`${v[1]} is not declared`);
        return `${px}px`;
      }
      return part;
    })
    .join(' ');

/**
 * The shim's value for the antd `size*` token each rung used to read, as the
 * shim resolved it in a browser: `buildTokens` probes `--spacing-N` through
 * `resolveAstryxVars`, here answered from the same stylesheet.
 */
vi.mock('../theme-shim/astryxVars', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../theme-shim/astryxVars')>();
  return {
    ...actual,
    resolveAstryxVars: (
      spec: Record<string, { var: string; kind: string }>,
    ): Record<string, string | number> =>
      Object.fromEntries(
        Object.entries(spec)
          .filter(([, { kind }]) => kind === 'length')
          .map(([name, { var: cssVar }]) => [
            name,
            astryxSpacing.get(cssVar) ?? 0,
          ]),
      ),
  };
});

/** The rung -> antd token table BAIFlex read through the shim until FR-4087. */
const SHIM_GAP_TOKEN = {
  xxs: 'sizeXXS',
  xs: 'sizeXS',
  sm: 'sizeSM',
  ms: 'sizeMS',
  md: 'sizeMD',
  lg: 'sizeLG',
  xl: 'sizeXL',
  xxl: 'sizeXXL',
} as const;
type Rung = keyof typeof SHIM_GAP_TOKEN;
const RUNGS = Object.keys(SHIM_GAP_TOKEN) as Rung[];

const gapOf = (element: ReturnType<typeof render>['container']) =>
  (element.firstChild as HTMLElement).style.gap;

describe('BAIFlex', () => {
  test('default render', () => {
    const { baseElement } = render(<BAIFlex />);
    expect(baseElement).toMatchSnapshot();
  });

  test('render with custom props', () => {
    const { baseElement } = render(
      <BAIFlex
        direction="column"
        wrap="wrap-reverse"
        justify="center"
        align="start"
        gap="sm"
        style={{ backgroundColor: 'blue' }}
      />,
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('render with children', () => {
    const { baseElement } = render(
      <BAIFlex>
        <div data-testid="firstChildComponent">
          <h1> First Child </h1>
          <div data-testid="nestedChildComponent">
            <h1> Nested Child </h1>
          </div>
        </div>
        <div data-testid="secondChildComponent">
          <h1> Second Child </h1>
        </div>
      </BAIFlex>,
    );

    expect(screen.getByTestId('firstChildComponent')).toBeInTheDocument();
    expect(screen.getByTestId('secondChildComponent')).toBeInTheDocument();
    expect(screen.getByTestId('nestedChildComponent')).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });

  // Regression guard for the collapsed-spacing bug: every named gap MUST
  // produce a concrete gap. A missing rung yields `undefined`, React omits the
  // declaration, and the flex silently packs to a 0 gap — visible as "layout
  // broken everywhere", with nothing failing.
  test.each([
    ['xxs', '4px'],
    ['xs', '8px'],
    ['sm', '12px'],
    ['ms', '16px'],
    ['md', '20px'],
    ['lg', '24px'],
    ['xl', '32px'],
    ['xxl', '48px'],
  ] as const)('gap="%s" resolves to %s', (gap, expected) => {
    const { container } = render(<BAIFlex gap={gap} />);
    expect(gapOf(container)).toMatch(/^var\(--spacing-[\d-]+\)$/);
    expect(toPx(gapOf(container))).toBe(expected);
  });

  describe.each(['light', 'dark'] as const)(
    'matches the theme-shim gap in %s mode',
    (mode) => {
      const token = buildTokens(mode) as unknown as Record<string, number>;

      test.each(RUNGS)('gap="%s"', (rung) => {
        const shimPx = token[SHIM_GAP_TOKEN[rung]];
        expect(shimPx).toBeGreaterThan(0);
        const { container } = render(<BAIFlex gap={rung} />);
        expect(toPx(gapOf(container))).toBe(`${shimPx}px`);
      });

      test('a row/column tuple', () => {
        const { container } = render(<BAIFlex gap={['sm', 'xxl']} />);
        expect(toPx(gapOf(container))).toBe(
          `${token.sizeSM}px ${token.sizeXXL}px`,
        );
      });
    },
  );

  test('a number is pixels, and a tuple mixes numbers and rungs', () => {
    const { container: numeric } = render(<BAIFlex gap={10} />);
    expect(gapOf(numeric)).toBe('10px');
    const { container: tuple } = render(<BAIFlex gap={[16, 'xs']} />);
    expect(toPx(gapOf(tuple))).toBe('16px 8px');
    const { container: none } = render(<BAIFlex />);
    expect(gapOf(none)).toBe('0px');
  });
});
