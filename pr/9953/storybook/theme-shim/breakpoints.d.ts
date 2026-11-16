export type BAIBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
/**
 * Minimum viewport width (px) at which each step becomes active.
 * `xs` is the floor: it is defined by its MAX, not its min (see the queries).
 *
 * Ant Design's defaults, verbatim — the values the app's 79 responsive
 * `Row`/`Col` props and 18 `Grid.useBreakpoint()` call sites are tuned to.
 */
export declare const BAI_BREAKPOINTS: Readonly<Record<BAIBreakpointKey, number>>;
export declare const BAI_BREAKPOINT_KEYS: ReadonlyArray<BAIBreakpointKey>;
/**
 * The media query per step, matching antd's `responsiveObserver`:
 * `xs` is `max-width` bounded (true ONLY below `sm`), every other step is
 * `min-width` bounded and therefore cumulative — at 1280px, `sm` `md` `lg`
 * `xl` are all true and `xs` `xxl` are false.
 *
 * The `.98` on the `xs` ceiling is antd's own guard against fractional device
 * pixel ratios leaving a 1px band where neither `xs` nor `sm` matches.
 */
export declare const BAI_BREAKPOINT_QUERIES: Readonly<Record<BAIBreakpointKey, string>>;
/** Same shape antd's `Grid.useBreakpoint()` returns. */
export type BAIScreenMap = Record<BAIBreakpointKey, boolean>;
/**
 * Drop-in replacement for antd's `Grid.useBreakpoint()`.
 *
 * Unlike antd's, every key is always present (antd returned a `Partial`), so
 * `screens.md` is a `boolean` rather than `boolean | undefined` — destructuring
 * call sites are unaffected, and the few that did `screens.md ?? true` can drop
 * the fallback.
 *
 * @example
 * const { lg } = useBAIBreakpoint();
 * const screens = useBAIBreakpoint();
 */
export declare function useBAIBreakpoint(): BAIScreenMap;
/**
 * The largest active step — handy where a call site wants one value rather
 * than a map (`Row`/`Col` responsive props will need this when they land).
 */
export declare function useBAIActiveBreakpoint(): BAIBreakpointKey;
